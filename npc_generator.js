const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Data
async function loadJSON(filepath) {
    const file = await fs.promises.readFile(__dirname + filepath, 'utf8');
    const data = await JSON.parse(file);
    //gconsole.log(data);
    return data;
}

// Helper functions
function normal(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    return z0 * stdDev + mean;
}

function normalDistribution(minVal, maxVal) {
    const mean = (maxVal + minVal) / 2;
    const stdDev = (maxVal - minVal) / 6; // 6 standard deviations from the mean
    while (true) {
        const value = Math.floor(normal(mean, stdDev));
        if (minVal <= value && value <= maxVal) {
            return value;
        }
    }
}

function normalDistributionPair(pair) {
    return normalDistribution(pair[0], pair[1]);
}

function weightedrandom(_choices) {
    choices = _choices;
    let totalWeight = 0;
    for (const choice of choices) {
        totalWeight += choice.weight || 0;
    }
    const randNum = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (const choice of choices) {
        cumulativeWeight += choice.weight;
        if (randNum <= cumulativeWeight) {
            return choice;
        }
    }
}

function unweightedrandom(choices) {
    const randIndex = Math.floor(Math.random() * choices.length);
    return choices[randIndex];
}

function weightedrandomnoreplacement(choices) {
    let totalWeight = 0;
    for (let i = 0; i < choices.length; i++) {
        totalWeight += choices[i].weight || 0;
    }
    const randNum = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < choices.length; i++) {
        cumulativeWeight += choices[i].weight;
        if (randNum <= cumulativeWeight) {
            const selectedChoice = choices[i];
            choices.splice(i, 1);
            return selectedChoice;
        }
    }
}

function fetchrandom(filepath) {
    const lines = fs.readFileSync(__dirname + filepath, 'utf-8').split('\n');
    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
}

function multivariateNormalDistribution(meanX, meanY) {
    const stdDev = 1;
    const x = normal(meanX, stdDev);
    const y = normal(meanY, stdDev);
    return [x, y];
}

function rollForStats() {
    const dice = [];
    for (let i = 0; i < 4; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
    }
    dice.sort((a, b) => a - b);
    dice.shift();
    const sum = dice.reduce((total, num) => total + num, 0);
    return sum;
}

function getModifier(score) {
    return Math.floor((score - 10) / 2);
}
function getModifierForDisplay(score) {
    const modifier = Math.floor((score - 10) / 2);
    if (modifier > 0) {
        return "+" + modifier;
    } else if (modifier < 0) {
        return modifier.toString();
    } else {
        return "+0";
    }
}

function rollDie(size) {
    return Math.floor(Math.random() * size) + 1;
}


// Generate NPC data
async function generate(num) {
    // Load Data
    const Output = await loadJSON('/config/output.json');
    const EyeColors = await loadJSON('/config/eye_colors.json');
    const HairColors = await loadJSON('/config/hair_colors.json');
    const Professions = await loadJSON('/config/professions.json');
    const Skills = await loadJSON('/config/skills.json');
    const Lifestyles = await loadJSON('/config/lifestyles.json');

    // Load Extended Data
    // Load Races
    const races = [];
    const raceFiles = fs.readdirSync(__dirname + "/config/races");
    for (const file of raceFiles) {
        if (file.endsWith('.json')) {
            const raceData = await loadJSON("/config/races/" + file);
            races.push(raceData);
        }
    }

    // Load Classes
    const classes = [];
    const classFiles = fs.readdirSync(__dirname + "/config/classes");
    for (const file of classFiles) {
        if (file.endsWith('.json')) {
            const classData = await loadJSON("/config/classes/" + file);
            classes.push(classData);
        }
    }

    const csvWriter = createObjectCsvWriter({
        path: 'output.csv',
        header: Output.header
    });

    records = [];

    for (let i = 0; i < num; i++) {
        // Select Race
        const race = await weightedrandom(races);

        //console.log(race); // debug_print

        // Select Subrace
        const subrace = weightedrandom(race.subraces);

        // Select Age
        const age = normalDistributionPair(race.age);

        // Select Height
        const height = normalDistributionPair(race.height);
        const height_string = Math.floor(height / 12) + "'" + height % 12;
        //console.log(height_string); // debug_print

        // Select Weight
        const weight = normalDistributionPair(race.weights);

        // Select Eye Color
        const eye_color = weightedrandom(EyeColors);

        // Select Hair Color
        const hair_color = weightedrandom(HairColors);

        // Select Gender
        const gender = Math.random() < 0.5 ? "Male" : "Female";

        // Select Name
        const first_name = fetchrandom("/names/" + race.name_file + (gender == "Male" ? "m" : "f") + ".txt");
        const last_name = fetchrandom("/names/surname.txt");

        // Select Alignment
        const meanLawfulness = (race.alignment[0][0] + race.alignment[0][1]) / 2 ;
        const meanKindness = (race.alignment[1][0] + race.alignment[1][1]) / 2 ;
        const alignment_point = multivariateNormalDistribution(meanLawfulness, meanKindness);
        const lawfulness =
            (alignment_point[0] >= 2 ? "Chaotic" :
            (alignment_point[0] >= 1 ? "Neutral" :
            ("Lawful")));
        const kindness =
            (alignment_point[1] >= 2 ? "Evil" :
            (alignment_point[1] >= 1 ? "Neutral" :
            ("Good")));

        // Select Ability Scores
        const ability_scores = [
            rollForStats() + race.ability_scores[0] + subrace.ability_scores[0],
            rollForStats() + race.ability_scores[1] + subrace.ability_scores[1],
            rollForStats() + race.ability_scores[2] + subrace.ability_scores[2],
            rollForStats() + race.ability_scores[3] + subrace.ability_scores[3],
            rollForStats() + race.ability_scores[4] + subrace.ability_scores[4],
            rollForStats() + race.ability_scores[5] + subrace.ability_scores[5]
        ];

        // Select Class
        const modifiedClasses = [];
        for (const c of classes) {
            const modifiedClass = {
                weight: c.weight,
                choice: c.choice
            };
            for (let i = 0; i < 5; ++i) {
                modifiedClass.weight += c.ability_score_weights[i] * (ability_scores[i]-10);
            };
            modifiedClass.weight = Math.max(modifiedClass.weight, 1);
            modifiedClasses.push(modifiedClass);
        };
        const class_choice = weightedrandom(modifiedClasses);
        const npc_class = classes.find(c => c.choice === class_choice.choice);

        //console.log(class_choice); // debug_print

        //     Select Subclass
        const npc_subclass = weightedrandom(npc_class.subclasses);

        // Select Profession
        const profession = weightedrandom(Professions);

        // Select Skills
        let skill_choices = [];
        for (const skillName of npc_class.skills) {
            const skill = Skills.find(skill => skill.choice === skillName);
            skill_choices.push(skill);
        }
        let npc_skills = [];
        for (let i = 0; i <= npc_class.skill_count; ++i) {
            const skill = weightedrandomnoreplacement(skill_choices);
            npc_skills.push(skill.choice);
        }
        const npc_skills_list = npc_skills.join("; ");
        
        // Select Lifestyle
        const modifiedLifestyles = [];
        for (let i = 0; i < Lifestyles.length; ++i) {
            const modifiedLifestyle = {
                weight: Lifestyles[i].weight,
                choice: Lifestyles[i].choice
            };
            modifiedLifestyle.weight += profession.lifestyle[i] * profession.impact;
            modifiedLifestyles.push(modifiedLifestyle);
        }
        const modifiedLifestyle = weightedrandom(modifiedLifestyles);
        const lifestyle = Lifestyles.find(l => l.choice === modifiedLifestyle.choice);

        // Select Income
        const income = normalDistributionPair(lifestyle.income);

        // Calculate HP
        const hp = npc_class.hit_die + getModifier(ability_scores[2]);
            
        // Add record to CSV
        records.push(
            {
                Race: race.choice,
                Subrace: subrace.choice,
                Age: age.toString() + " yrs",
                Height: height_string,
                Weight: weight.toString() + " lbs",
                'Eye Color': eye_color.choice,
                'Hair Color': hair_color.choice,
                Gender: gender,
                "First Name": first_name,
                "Last Name": last_name,
                Lawfulness: lawfulness,
                Kindness: kindness,
                Strength: (ability_scores[0] - 2).toString() + " (" + getModifierForDisplay(ability_scores[0]) + ")",
                Dexterity: (ability_scores[1] - 2).toString() + " (" + getModifierForDisplay(ability_scores[1]) + ")",
                Constitution: (ability_scores[2] - 2).toString() + " (" + getModifierForDisplay(ability_scores[2]) + ")",
                Intelligence: (ability_scores[3] - 2).toString() + " (" + getModifierForDisplay(ability_scores[3]) + ")",
                Wisdom: (ability_scores[4] - 2).toString() + " (" + getModifierForDisplay(ability_scores[4]) + ")",
                Charisma: (ability_scores[5] - 2).toString() + " (" + getModifierForDisplay(ability_scores[5]) + ")",
                Class: npc_class.choice,
                Subclass: npc_subclass.choice,
                Profession: profession.choice,
                'Tool Proficiency': profession.tools,
                Skills: npc_skills_list,
                Lifestyle: lifestyle.choice,
                Income: income/100 + " gp",
                'Hit Points': hp,
            }
        );
    }

    csvWriter.writeRecords(records)
        .then(() => console.log('Successfuly generated.'))
        .catch((error) => console.error('Error generating:', error));
}

function main() {
    if (process.argv[2]) {
        generate(parseInt(process.argv[2]));
        return;
    } else {
        console.log("No number provided. Generating 1000 NPCs.");
        generate(1000);
    }
}

main();