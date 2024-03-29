const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Data
const races = require('./config/races.json');
const output = require('./config/output.json');;
const eye_colors = require('./config/eye_colors.json');
const hair_colors = require('./config/hair_colors.json');
const classes = require('./config/classes.json');
const professions = require('./config/professions.json');
const skills = require('./config/skills.json');
const socioeconomic_classes = require('./config/socioeconomic_classes.json');

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

function weightedrandom(choices) {
    const totalWeight = choices.reduce((sum, { weight }) => sum + weight, 0);
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

function fetchrandom(filepath) {
    const lines = fs.readFileSync(filepath, 'utf-8').split('\n');
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
function generate(num) {
    const csvWriter = createObjectCsvWriter(output.csv);

    records = [output.header];

    for (let i = 0; i < num; i++) {
        // Select Race
        const race_choice = weightedrandom(races);
        const race = require("./config/races/" + race_choice.file + ".json");

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
        const eye_color = weightedrandom(eye_colors);

        // Select Hair Color
        const hair_color = weightedrandom(hair_colors);

        // Select Gender
        const gender = Math.random() < 0.5 ? "Male" : "Female";

        // Select Name
        const first_name = fetchrandom("./names/" + race.name_file + (gender == "Male" ? "m" : "f") + ".txt");
        const last_name = fetchrandom("./names/surname.txt");

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
        for (const c of classes) {
            for (let i = 0; i < 5; ++i) {
                c.weight += c.ability_score_weights[i] * (ability_scores[i]-10);
            }
            c.weight = Math.max(c.weight, 1);
        }
        const class_choice = weightedrandom(classes);
        const pclass = require("./config/classes/" + class_choice.file + ".json");

        //console.log(class_choice); // debug_print

        //     Select Subclass
        const subclass_choice = weightedrandom(pclass.subclasses);

        // Select Profession
        const profession = weightedrandom(professions);

        // Select Skills
        npc_skills = [];
        npc_skills.push(weightedrandom(skills));
        npc_skills[0].weight = 0;
        npc_skills.push(weightedrandom(skills));
        
        // Select Lifestyle
        for (let i = 0; i < socioeconomic_classes.length; ++i) {
            socioeconomic_classes[i].weight += profession.lifestyle[i] * profession.impact;
        }
        const lifestyle = weightedrandom(socioeconomic_classes);

        // Select Income
        const income = normalDistributionPair(lifestyle.income);
            
        // Add record to CSV
        records.push(
            {
                Race: race_choice.choice,
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
                Class: class_choice.choice,
                Subclass: subclass_choice.choice,
                Profession: profession.choice,
                'Tool Proficiency': profession.tools,
                Skills: npc_skills.map(skill => skill.choice).join(", "),
                Lifestyle: lifestyle.choice,
                Income: income/100 + " gp",
                'Hit Points': pclass.hit_die + getModifier(ability_scores[2]),
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