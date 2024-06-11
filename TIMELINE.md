# Timeline

This file serves to explain potential areas for future development. These are features that we have determined would be valuable, but have not yet added to the project plan. 

> _For the purposes of CSE 112, these are features that were not added before the code cutoff, or areas where future teams adopting this project could progress._

## Responsive design / mobile compatibility
The current implementation of versus mode essentially completely fails on small screens. This is unfortunate as mobile users are currently a very large market among our target demographic. However, it can be noted that there is no inherent setback preventing the adoption of a design compatible with mobile devices.

#### Considerations
- We generated prototypes for a mobile design on Figma, which can be found in `/design/prototypes`
- Focus should be placed on fluid design, as opposed to hard breakpoints

## Practice mode
We currently have a dead button for practice mode on versus mode. In essence, this mode is just intended to give the ability to play against a bot. At the most basic level, this facilitates better understanding of the game rules for new players. For more experienced users, this practice mode would allow them to test theories about gameplay strategies and learn to play better. Furthermore, the mode would enable the ability for completely offline play. This would open the door to structuring our site as a PWA, which would then only need internet for PvP versus mode (and otherwise operate completely locally).

### Considerations
- Under the current implementation, the basically gameplay structure relies on the Web Socket routing incoming server actions to various functions. Namely, to implement a bot, one would only need to implement the game logic (i.e., which card the bot chooses) and then call the same functions as the router. 
- A first implementation could just have the bot selecting a random card from the available; for most purposes (i.e., given the luck-based nature of the game), this would be a viable strategy
- Later implementations could add more advanced strategies that take into account the current world event (as well as the probability of certain world events occuring later on)
- The chat box should probably be hidden from practice mode
- If the PWA route is persued, it might be wise to rework the offline notification to be less intrusive; something like a simple icon could be less in-the-face

## More commands
In the chat box on versus mode, users have the ability to enter commands by prefacing their message with a specific character (currently `/`). Presently, the only command that can be used is `/debug`, which toggles the debug menu on/off. This would be an area with essentially unbounded potential for new features. Here, we suggest a few:

### Minute control
Commands can be used to grant users granular control over the gameplay flow. They could add direct access to settings that are otherwise housed behind the settings UI. Furthermore, commands could be used to enable text-based gameplay for users who cannot or do not want to interact with the visual aspects of the game (as a side effect, this would make testing easier in some regards).

### Trolling/fun/music
Commands could be used to grant users the ability to mess with their opponent. Considering the game is largely unserious already, this would likely be a welcome feature by most users (namely, it is among the users we asked). These commands could be used to play sound effects in the opponent's game, play videos, move buttons around the screen, change cards arbitrarily, and/or reskin the game aesthetic. This could be accompanied with a server-side authentication system of sorts (a password maybe?) to prevent abuse.

## Tournament mode
Most of the above features range in the small–medium range of work required. Adding a tournament mode, on the other hand, is a potential area for a large addition. This mode could allow larger lobbies (i.e., >2), which split into many smaller two-person rounds in a bracket. One winner would then be crowned at the end. Many successful browser-based online games are party games, which indeed cater to our user personas. We believe that adding this feature would have a very large payoff. It would, however, require a large amount of work.

### Considerations
- The fundamental architecture of the system could likely remain largely the same; depending on how the tournament is implemented, the gameplay loop itself could remain almost identical and users could just be pulled in/out of game instances
- Load testing the web socket server would be a good idea here; we have yet to see any substantial degradation of performance running everything in-memory on a single CPU with Node. This is obviously not, however, the most scalable approach. If just slight performance loss is seen, running code in parallel with Node workers could be explored. If significant performance loss is seen, a nuclear solution to explore is running each (maybe couple) game instance(s) in a Kubernetes pod. This likely would not require it, but could be accompanied with moving game state to Redis.