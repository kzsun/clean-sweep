# Clean Sweep

**Clean Sweep** is an environmental cleanup game for FriendSDK v0.1. The selected
Rare Friend collects ordinary litter for free, sorts it and restores a community
world across four stages. Completed cleanup rounds uncover valuable salvage. Recovering that
sellable material requires a paid, single-use pair of Salvage Gloves.

## Run

From the FriendSDK repository root:

```sh
npm ci
npm run dev:game -- games/clean-sweep --host 0.0.0.0 --port 4173
```

Open `http://localhost:4173` on the computer. A phone on the same network can use
`http://YOUR_COMPUTER_LAN_IP:4173` when the firewall and WSL networking permit
it. The connected wallet must be on Robinhood mainnet (chain 4663) and own a
hardwired Rare Friends Generations NFT of generation 1 or higher.

## Controls and rules

- Move with WASD or the arrow keys, or tap/click a destination.
- Press E or tap the enabled prompt near an object.
- Collect five ordinary litter items and sort each into Recycle, Compost or
  Landfill. This core cleanup loop is free.
- Correctly sorting a full bag restores 50% stage cleanliness and reveals one valuable
  salvage opportunity. Wrong answers reveal the correct bin and subtract 10
  score points.
- One pair of Salvage Gloves costs 1 simulated RF and is consumed by exactly one
  valuable salvage recovery. Valuable material can be kept or sold at its fixed
  simulated RF price with no expiry.

## Four stages

Complete two bags (10 pickups) to unlock the next stage. Tools, RF, recovered
inventory, score and unused salvage opportunities carry over between stages.
After the fourth stage, choose Return home for an 11-second monochrome ending:
your selected Rare Friend walks home, enters the bedroom and sleeps under a
quilt. Original character pixels remain unchanged. Subtitles are bilingual;
skip and reduced motion jump to the good-night scene. Pausing or hiding the tab
pauses the sequence. Play again starts at the park. Reloading resets progress.

1. Park: cans, banana peels, cups, bottles and snack wrappers.
2. Riverside: a river spanning the stage, gravel banks and a wooden crossing; tangled fishing line, cans, plastic bags, snack wrappers and PET bottles. Water blocks movement; use the bridge.
3. Raccoon City: a police station, burning apartment building and overturned train; spent casings, empty medicine bottles, bent pliers, broken fuses and rotten meat.
4. Grand Line: ship timber, Sea King meat, torn sails, broken ropes and barrels.

Each stage has themed scenery and visible canvas litter. One pickup target is
shown at a time. Sorting labels are resource recovery, organic waste and special
collection; these are game rules. Paid salvage outcomes and prices remain common
across all stages, as listed below.

Stage names, litter, sorting choices and stage progression include Japanese and
English. Scenery is original procedural canvas art; flames and smoke are static.

## Exact simulated economy

| Outcome | Chance | Fixed sale value | EV contribution |
| --- | ---: | ---: | ---: |
| Aluminium Bundle | 50% / 5,000 bps | 0.25 RF | 0.125 RF |
| E-waste Components | 30% / 3,000 bps | 0.75 RF | 0.225 RF |
| Copper Coil | 15% / 1,500 bps | 1.50 RF | 0.225 RF |
| Vintage Device | 5% / 500 bps | 5.00 RF | 0.250 RF |
| **Total** | **100%** |  | **0.825 RF** |

| Rule | Exact value |
| --- | --- |
| Salvage Gloves price | 1 RF (`1000000000000000000` base units) |
| Expected recovery value | 0.825 RF |
| Maximum recovery | 5 RF |
| Tool rule | One purchased pair is consumed by one salvage recovery |
| Backing | Each purchased or pending pair reserves 5 RF; kept salvage reserves its fixed value |
| Redemption | Fixed value, no expiry; paid to the Friend's canonical wallet in a future approved live integration |

All RF balances, tool purchases, outcomes and sales are simulated and reset when
the preview reloads. No contracts are deployed and no transactions are sent.
Production persistence, global park progress and real token activity require
future SDK/platform support and Rare Friends review.

## Accessibility and assets

The game supports keyboard and touch movement, responsive scaling inside the
960 × 640 container, mute, reduced motion, loading, errors and retry. It uses the
SDK's canonical selected-Friend sprites without modification. The garden,
scenery and procedural sounds are bundled FriendSDK assets. Interface shapes,
symbols and styling are original CSS with no third-party assets.
