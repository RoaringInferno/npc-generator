# NPC Generator
A tool to create bulk NPCs for your D&amp;D game.

# Explanation of Output
## Race
Race.
## Subrace
Subrace. Can be left blank.
## Age
Normal distribution, by race.
## Height
Normal distribution, by race.
## Weight
Normal distribution, by race.
## Eye Color
Weighted random, not by race.
## Hair Color
Weighted random, not by race.
## Gender
50/50.
## First Name
Random, by race.
## Last Name
Random. 
## Lawfulness
Normal distribution, by race. (Lawful/Neutral/Chaotic)
## Kindness
Normal distribution, by race. (Good/Neutral/Evil)
## Profession
Weighted random.
## Tool Proficiency
By Profession.
## Lifestyle
Weighted random, by profession. (Poor, Comfortable, Modest, Rich, Aristocratic)
## Income
Normal distribution, by lifestyle. Monthly income, in gp. (# gp)
## Strength
4d6 drop lowest.
## Dexterity
4d6 drop lowest.
## Constitution
4d6 drop lowest.
## Intelligence
4d6 drop lowest.
## Wisdom
4d6 drop lowest.
## Charisma
4d6 drop lowest.
## Class
Weighted random, by ability scores.
## Subclass
Weighted random, by class.

# Usage
```node npc_generator.js <count>```. ```<count>``` represents the number of NPCs to generate, 1000 by default.

# Configuration
Change the values in ```config/``` to change race, subrace, class, subclass, physical attribute, and profession percentages.

# Credits
https://www.reddit.com/user/OrkishBlade/
at
https://www.reddit.com/r/DnDBehindTheScreen/comments/50pcg1/a_post_about_names_names_for_speakers_of_the/
, for the names in ```names/```.

## Release Compile Command
```pkg npc_generator.js -o npc_generator --targets node14-macos-arm64,node14-macos-x64,node14-linux-x64,node14-win-x64```
