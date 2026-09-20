"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameWorld, type GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { STAGES, ROUND_SIZE, ROUNDS_PER_STAGE, station, salvageSpot, spawn, type WasteCategory, type WasteItem } from "./stages";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GamePlay, type GameSnapshot } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";
import "./style.css";
import { drawLitter } from "./litter-art";
import { riverGround, cityObjects } from "./scenery";
import { HomeEnding } from "./ending";

type Menu = "intro" | "sort" | "complete" | "salvage" | "reward" | "inventory" | "settings" | null;
const CATEGORY_LABELS: Readonly<Record<WasteCategory, string>> = { recycle: "資源回収 / Recycle", compost: "有機物 / Organic", landfill: "専用回収 / Special" };
const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

/** Free public cleanup plus an optional paid tool for recoverable, sellable salvage. */
export default function CleanSweep({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [menu, setMenu] = useState<Menu>("intro");
  const [bag, setBag] = useState<WasteItem[]>([]);
  const [pickupIndex, setPickupIndex] = useState(0);
  const [sorting, setSorting] = useState<WasteItem[] | null>(null);
  const [sortIndex, setSortIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [ending, setEnding] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [salvageFinds, setSalvageFinds] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GamePlay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sound = useRef<FriendSoundKit | null>(null);
  const locked = useRef(false);
  const epoch = useRef(0);
  const definition = client.definition;
  const stage = STAGES[stageIndex];
  const cleanliness = Math.min(100, rounds * 100 / ROUNDS_PER_STAGE);
  const pending = snapshot?.plays.find(play => play.outcomeId === null);
  const complete = rounds >= ROUNDS_PER_STAGE;
  const activeWaste = !complete && bag.length < ROUND_SIZE ? stage.waste[pickupIndex % stage.waste.length] : null;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null); setMenu("intro"); setBag([]); setPickupIndex(0); setSorting(null); setSortIndex(0);
    setStageIndex(0); setEnding(false); setRounds(0); setSalvageFinds(0); setScore(0); setStreak(0); setMistakes(0); setResult(null);
    setBusy(false); setError(""); setMessage(""); setMuted(true); locked.current = false;
    void client.read().then(value => { if (version === epoch.current) setSnapshot(value); }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Could not load Clean Sweep.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => { epoch.current++; sound.current?.dispose(); sound.current = null; preference.removeEventListener("change", update); };
  }, [client, friendId]);

  useEffect(() => { if (paused) sound.current?.stop(); }, [paused]);

  const interactions = useMemo<readonly GameWorldInteraction[]>(() => {
    const items: GameWorldInteraction[] = [];
    if (activeWaste) items.push({ id: `waste:${activeWaste.id}`, label: `${activeWaste.symbol} PICK UP ${activeWaste.short}`, position: activeWaste.position, reach: 58, labelOffset: 22 });
    if (bag.length === ROUND_SIZE) items.push({ id: "sort", label: bag.length === ROUND_SIZE ? "SORT FULL BAG" : `SORT BAG · ${bag.length}/${ROUND_SIZE}`, position: station, reach: 76, labelOffset: -150 });
    if (salvageFinds || pending) items.push({ id: "salvage", label: `VALUABLE SALVAGE · ${salvageFinds}`, position: salvageSpot, reach: 72, labelOffset: -128 });
    return items;
  }, [activeWaste, bag.length, salvageFinds, pending]);

  async function act(work: () => Promise<void>, cue?: FriendSoundCue) {
    if (locked.current || paused) return;
    const version = epoch.current;
    locked.current = true; setBusy(true); setError(""); setMessage(""); void sound.current?.unlock();
    try {
      await work();
      const value = await client.read();
      if (version === epoch.current) { setSnapshot(value); if (cue) sound.current?.play(cue); }
    } catch (cause) {
      if (version === epoch.current) { setError(cause instanceof Error ? cause.message : "The preview action failed."); try { const fresh = await client.read(); if (version === epoch.current) setSnapshot(fresh); } catch { /* Keep the original action error visible. */ } }
    } finally {
      if (version === epoch.current) { locked.current = false; setBusy(false); }
    }
  }

  function navigate(next: Menu) {
    if (busy || paused) return;
    setMenu(next); setError(""); setMessage(""); sound.current?.play("select");
  }

  function pickUp() {
    if (!activeWaste || bag.length >= ROUND_SIZE || paused || busy) return;
    void sound.current?.unlock(); sound.current?.play("action-ready");
    setBag(current => [...current, activeWaste]); setPickupIndex(index => index + 1); setScore(value => value + 25);
    setMessage(`${activeWaste.name} collected.`);
  }

  function openSorting() {
    if (bag.length !== ROUND_SIZE || busy || paused) return;
    if (!sorting) { setSorting([...bag]); setSortIndex(0); }
    navigate("sort");
  }

  function sortInto(category: WasteCategory) {
    if (!sorting || !sorting[sortIndex] || paused || busy) return;
    const item = sorting[sortIndex];
    void sound.current?.unlock();
    if (item.category !== category) {
      setMistakes(value => value + 1); setStreak(0); setScore(value => Math.max(0, value - 10));
      setMessage(`Not quite — ${item.name} belongs in ${CATEGORY_LABELS[item.category]}.`); sound.current?.play("impact"); return;
    }
    const nextStreak = streak + 1;
    setStreak(nextStreak); setScore(value => value + 100 + Math.min(50, nextStreak * 10));
    setMessage(`Correct! ${item.name} → ${CATEGORY_LABELS[category]}.`); sound.current?.play("reward");
    if (sortIndex + 1 < sorting.length) { setSortIndex(index => index + 1); return; }
    setBag([]); setSorting(null); setSortIndex(0); setRounds(value => value + 1); setSalvageFinds(value => value + 1); setMenu("complete");
    sound.current?.play(rounds + 1 >= ROUNDS_PER_STAGE ? "reveal-legendary" : "reveal-rare");
  }

  function buyGloves() {
    if (!snapshot || paused || busy) return;
    void act(async () => { await client.buy(1n); setMessage("One simulated pair of Salvage Gloves added."); }, "purchase");
  }

  function recoverSalvage() {
    if (!snapshot || paused || busy || (!pending && (salvageFinds < 1 || snapshot.consumables === 0n))) return;
    void act(async () => {
      const pending = snapshot.plays.find(play => play.outcomeId === null);
      const play = pending ?? (await client.play(1n))[0];
      if (!pending) setSalvageFinds(value => Math.max(0, value - 1));
      const settled = await client.settle(play.id);
      setResult(settled); setMenu(settled.outcomeId === null ? "salvage" : "reward");
    }, "reveal-rare");
  }

  function redeem(outcomeId: number, quantity = 1n) {
    void act(async () => { await client.redeem(outcomeId, quantity); setResult(null); setMenu("inventory"); setMessage(`Sold for ${rf(definition.outcomes[outcomeId - 1].reward)}.`); }, "reward");
  }

  function nextStage() {
    if (!complete || busy || paused) return;
    if (stageIndex === STAGES.length - 1) { sound.current?.stop(); setMenu(null); setEnding(true); return; }
    setStageIndex(value => (value + 1) % STAGES.length);
    setBag([]); setSorting(null); setSortIndex(0); setRounds(0); setPickupIndex(0); setStreak(0);
    // Keep the SDK client, tools, inventory, RF and unclaimed salvage across stages.
    navigate("intro");
  }

  if (!snapshot) return <div className="clean-loading" role={error ? "alert" : "status"}><span className="clean-loader" aria-hidden="true">♻</span><strong>{error || "Preparing the cleanup crew…"}</strong>{error && <button type="button" disabled={busy || paused} onClick={() => void act(async () => {})}>Retry</button>}</div>;
  if (snapshot.friendId !== friendId) return <p role="alert">This game session does not match the selected Friend.</p>;
  if (ending) return <HomeEnding friendId={friendId} paused={paused} reducedMotion={reducedMotion} score={score} onReplay={() => {
    if (paused || busy) return;
    setEnding(false); setStageIndex(0); setBag([]); setSorting(null); setSortIndex(0); setRounds(0); setPickupIndex(0); setStreak(0); navigate("intro");
  }} />;

  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const inventoryCount = snapshot.inventory.reduce((total, amount) => total + amount, 0n);
  const maxPrize = maximumPrize(definition);
  const canBuy = snapshot.rfBalance >= definition.price && snapshot.freeStake >= maxPrize && snapshot.freeStake + definition.price >= maxPrize;
  const currentSort = sorting?.[sortIndex] ?? null;
  const feedback = <p className={error ? "clean-error" : "clean-feedback"} role={error ? "alert" : "status"}>{error || message || (busy ? "Waiting for preview confirmation…" : "RF, tools, outcomes and sales are simulated.")}</p>;

  return <section className={`clean-game clean-theme-${stage.theme} clean-level-${Math.floor(cleanliness / 25)}${reducedMotion ? " clean-reduced" : ""}`} aria-label="Clean Sweep" aria-busy={busy}>
    <div className="clean-world" inert={Boolean(menu) || paused || undefined}>
      <GameWorld key={stageIndex} color world={stage.world} spawn={spawn} interactions={interactions} friendId={friendId} paused={Boolean(menu) || paused} reducedMotion={reducedMotion}
        drawGround={stage.theme === "river" ? c => riverGround(c, stage.world) : undefined}
        objects={[...(stage.theme === "city" ? cityObjects : []), ...(activeWaste ? [{ id: activeWaste.id, position: activeWaste.position, draw: (c: CanvasRenderingContext2D, x: number, y: number) => drawLitter(activeWaste.id, c, x, y) }] : [])]}
        onInteract={id => { if (id.startsWith("waste:")) pickUp(); else if (id === "sort") openSorting(); else if (id === "salvage") navigate("salvage"); }} />
      <div className="clean-glow" aria-hidden="true" />
      <header className="clean-hud">
        <div className="clean-brand"><small>STAGE {stageIndex + 1} / 4</small><strong>{stage.name}</strong></div>
        <div className="clean-meter" aria-label={`Stage cleanliness ${cleanliness}%`}><span><b>清掃率 / Clean</b><b>{cleanliness}%</b></span><i><i style={{ width: `${cleanliness}%` }} /></i></div>
        <button type="button" onClick={() => navigate("inventory")}>Salvage <b>{inventoryCount.toString()}</b></button>
        <button type="button" aria-label="Open settings" onClick={() => navigate("settings")}>⚙</button>
      </header>
      <aside className="clean-mission" aria-live="polite"><small>{stage.name}</small>{complete ? <><strong>ステージクリア！ / Stage clear!</strong><button type="button" style={{pointerEvents:"auto"}} onClick={() => navigate("complete")}>{stageIndex === 3 ? "全ステージ完了 / All stages clear" : "次のステージへ / Next stage"}</button></> : bag.length < ROUND_SIZE && activeWaste ? <><strong>Find the {activeWaste.name}</strong><span>Bag {bag.length}/{ROUND_SIZE} · Score {score.toLocaleString()}</span></> : <><strong>Bag full — visit the sorting station</strong><span>Sort all {ROUND_SIZE} items to heal the park.</span></>}</aside>
      <p className="clean-controls"><span className="clean-desktop">WASD / arrows · Tap to walk · E to act</span><span className="clean-mobile">Tap to walk · Tap a nearby action</span></p>
    </div>

    {menu && <GameMenu title={menu === "intro" ? "Clean Sweep" : menu === "sort" ? "Sorting Station" : menu === "complete" ? "Cleanup Complete" : menu === "salvage" ? "Valuable Salvage" : menu === "reward" ? "Recovered Material" : menu === "inventory" ? "Salvage Locker" : "Settings"} onClose={menu === "intro" || busy ? undefined : () => navigate(null)}>
      {menu === "intro" ? <div className="clean-intro"><span className="clean-hero-mark" aria-hidden="true">♻</span><p className="clean-kicker">STAGE {stageIndex + 1} / 4</p><h2>{stage.name}</h2><p>{stage.subtitle}</p><p>5個集めて分別 × 2回でクリア。道具と回収品は引き継ぎます。 / Collect and sort 5 items twice. Tools, RF and salvage carry over.</p><ol><li><b>Collect</b> ordinary litter for free.</li><li><b>Sort</b> five items to restore the park.</li><li><b>Recover</b> sellable salvage using paid gloves.</li></ol><button type="button" className="rf-frame-primary clean-start" onClick={() => navigate(null)}>Start cleanup</button></div>
      : menu === "sort" && currentSort ? <div className="clean-sorter"><div className="clean-sort-progress"><span>ITEM {sortIndex + 1} / {sorting?.length}</span><span>STREAK ×{streak}</span></div><div className="clean-waste-card" aria-label={currentSort.name}><span aria-hidden="true">{currentSort.symbol}</span><strong>{currentSort.name}</strong></div><p>どこへ分別する？ / Which bin? (Game rules)</p><div className="clean-bins">{(Object.keys(CATEGORY_LABELS) as WasteCategory[]).map(category => <button type="button" key={category} className={`clean-bin clean-bin-${category}`} disabled={busy || paused} onClick={() => sortInto(category)}><span aria-hidden="true">{category === "recycle" ? "♻" : category === "compost" ? "✿" : "■"}</span>{CATEGORY_LABELS[category]}</button>)}</div>{feedback}</div>
      : menu === "complete" ? <div className="clean-complete"><span className="clean-hero-mark" aria-hidden="true">{cleanliness >= 100 ? "★" : "+50%"}</span><p className="clean-kicker">{cleanliness >= 100 ? "STAGE CLEAR" : "CLEANUP PROGRESS"}</p><h2>{cleanliness >= 100 ? `${stage.name} — 清掃完了 / Cleanup complete!` : `${cleanliness}% clean — keep going!`}</h2><p>Your cleanup uncovered one piece of valuable salvage. To recover and sell it safely, visit the crate and use one paid pair of Salvage Gloves.</p><div className="clean-complete-actions"><button type="button" className="rf-frame-primary" onClick={() => navigate(null)}>Keep cleaning</button><button type="button" onClick={() => navigate("salvage")}>Inspect salvage</button>{complete && <button type="button" className="rf-frame-primary" onClick={nextStage}>{stageIndex === 3 ? "家に帰る / Return home" : `次へ / Next: ${STAGES[stageIndex + 1].name}`}</button>}</div></div>
      : menu === "salvage" ? <><p>Sellable salvage needs protective equipment. One pair of <b>Salvage Gloves</b> costs {rf(definition.price)} and is consumed by one recovery.</p><div className="clean-sponsor-stats"><span>Salvage found <b>{salvageFinds}</b></span><span>Gloves <b>{snapshot.consumables.toString()}</b></span><span>Preview balance <b>{rf(snapshot.rfBalance)}</b></span><span>Best find <b>{rf(maxPrize)}</b></span></div><table><thead><tr><th>Possible find</th><th>Chance</th><th>Sale value</th></tr></thead><tbody>{definition.outcomes.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.chanceBps / 100}%</td><td>{rf(item.reward)}</td></tr>)}</tbody></table><div className="clean-complete-actions"><button type="button" disabled={!canBuy || busy || paused} onClick={buyGloves}>Buy gloves · {rf(definition.price)}</button><button type="button" className="rf-frame-primary" disabled={(!pending && (salvageFinds < 1 || snapshot.consumables === 0n)) || busy || paused} onClick={recoverSalvage}>{pending ? "Resume recovery" : "Use gloves & recover"}</button></div>{!canBuy && <p>{snapshot.rfBalance < definition.price ? "Not enough simulated RF." : "New tool purchases are paused until enough prize backing is free."}</p>}<p>Each glove purchase reserves {rf(maxPrize)} for its possible recovered material. Purchased gloves remain usable.</p>{feedback}</>
      : menu === "reward" && outcome ? <div className="clean-badge-reveal"><span aria-hidden="true">✦</span><p className="clean-kicker">VALUABLE MATERIAL RECOVERED</p><h2>{outcome.name}</h2><p>{outcome.chanceBps / 100}% chance · fixed sale value {rf(outcome.reward)}</p><div className="clean-complete-actions"><button type="button" onClick={() => navigate(null)}>Keep it</button><button type="button" className="rf-frame-primary" disabled={busy || paused} onClick={() => redeem(result!.outcomeId!, 1n)}>Sell · {rf(outcome.reward)}</button></div></div>
      : menu === "inventory" ? <><p>Recovered materials keep their fixed simulated sale value with no expiry.</p>{definition.outcomes.map((item, index) => <div className="clean-inventory-item" key={item.name}><span aria-hidden="true">{snapshot.inventory[index] ? "✦" : "◇"}</span><div><strong>{item.name}</strong><small>{snapshot.inventory[index].toString()} held · {rf(item.reward)} each</small></div><button type="button" disabled={busy || paused || snapshot.inventory[index] === 0n} onClick={() => redeem(index + 1, 1n)}>Sell one</button></div>)}<p>Cleanup score: <b>{score.toLocaleString()}</b> · Sorting mistakes: <b>{mistakes}</b></p>{feedback}</>
      : menu === "settings" ? <><button type="button" aria-pressed={!muted} onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); if (!next) void sound.current?.unlock(); }}>{muted ? "Sound off" : "Sound on"}</button><label><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> Reduce motion</label><p>Ordinary cleanup is free. Gloves, RF balances, valuable salvage outcomes and sales are simulated. Reloading resets this preview. Wallet connection and NFT ownership verification come from FriendSDK.</p></> : null}
    </GameMenu>}
  </section>;
}
