import { GENERATION_SPRITE_MANIFEST } from "./generation-sprites.js";
import type { FriendWalletProvider } from "./wallet.js";

/** Called by an explicit trusted-host button, never by sandbox game code. */
export async function switchFriendNetwork(provider: FriendWalletProvider, assertActive: () => void) {
  const chainId = `0x${GENERATION_SPRITE_MANIFEST.chainId.toString(16)}`;
  const switchChain = () => provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
  assertActive();
  try {
    await switchChain();
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== 4902) throw error;
    assertActive();
    await provider.request({ method: "wallet_addEthereumChain", params: [{
      chainId, chainName: "Robinhood mainnet",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: [GENERATION_SPRITE_MANIFEST.rpcUrl],
    }] });
    assertActive();
    await switchChain();
  }
  assertActive();
  const actual = await provider.request({ method: "eth_chainId" });
  assertActive();
  if (typeof actual !== "string" || !/^0x[0-9a-f]+$/i.test(actual) || BigInt(actual) !== BigInt(chainId)) {
    throw new Error("Wallet did not switch to Robinhood mainnet. Please retry.");
  }
}
