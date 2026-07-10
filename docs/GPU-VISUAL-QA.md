# GPU Visual QA Runner

The GitHub Pages build is already public. This runner opens that build with the physical GPU in a normal Windows desktop session and captures four repeatable review angles:

- Arcade cabinet front
- Arcade cabinet quarter view
- Desk monitor mount
- Storage cabinet handles

The screenshots and `diagnostics.json` are saved as a GitHub Actions artifact and published to `qa-results/` in the public play repository. They let Codex inspect the exact visual output without RDP or direct browser control.

## One-time Windows setup

1. On the GPU-equipped Windows computer, sign in to GitHub and open the public play repository's **Settings -> Actions -> Runners** page.
2. Choose **New self-hosted runner**, then select **Windows** and **x64**. Follow GitHub's generated download and configuration commands in a dedicated folder such as `C:\actions-runner`.
3. During configuration, register it to `https://github.com/maloysius-wq/uptime-empire-play` with the labels `gpu,windows` and a name such as `uptime-gpu-qa`.
4. Start it with `run.cmd`. Keep it running as the signed-in desktop user. Do not install this runner as a Windows service: the visual test needs an active, unlocked desktop so Chrome can use the physical GPU.
5. In Chrome, make sure **Use hardware acceleration when available** is enabled under **Settings -> System**, then restart Chrome once.

Keep this runner scoped to the single `uptime-empire-play` repository and only run workflows from trusted `main` commits. A self-hosted runner executes repository workflow code on that Windows account.

## Running a capture

1. In `maloysius-wq/uptime-empire-play`, open **Actions -> GPU Visual QA**.
2. Select **Run workflow**. The default URL is the published GitHub Pages game.
3. After it completes, open `qa-results/` in the repository or download the `uptime-empire-gpu-visual-qa` artifact.

The workflow deliberately runs only by manual dispatch. The Chrome window may appear briefly while it captures the scene.
