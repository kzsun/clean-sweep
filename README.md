# Clean Sweep

A four-world Rare Friends cleanup game, built with FriendSDK for the Rare Friends Vibeathon.

Your owned Rare Friend cleans a park, a riverside, Raccoon City and the Grand Line, sorts the litter, optionally recovers sellable salvage with paid (simulated) Salvage Gloves, then goes home and falls asleep.

- **Play:** https://kzsun.github.io/clean-sweep/
  (needs a browser wallet on Robinhood mainnet (chain 4663) holding a Rare Friends Generations NFT, generation 1 or higher)
- **Game code:** [games/clean-sweep/](games/clean-sweep/)
- **Controls and rules:** [games/clean-sweep/README.md](games/clean-sweep/README.md)
- **Vibeathon submission:** https://github.com/spokesz/rarefriends-vibeathon/pull/11

## Run locally

Node.js 22 or later (Windows users: Ubuntu on WSL2).

    npm ci
    npm run dev:game -- games/clean-sweep --host 0.0.0.0 --port 4176

Then open http://localhost:4176.

## Notes

- RF costs and rewards are simulated. No signature or transaction is requested; the game only reads your NFT ownership.
- This repository is a FriendSDK 0.1.0 checkout. Three host files (`src/game-host.tsx`, `src/switch-network.ts`, `src/world-view.tsx`) were modified to add a "Switch to Robinhood" button.
- Raccoon City and Grand Line are fan themes. They are not affiliated with their respective franchises, and no third-party franchise images or music are included.
