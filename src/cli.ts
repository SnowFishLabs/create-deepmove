#!/usr/bin/env node
import arg from 'arg';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { readDirDeepSync } from 'read-dir-deep';
import { execSync, ExecSyncOptionsWithBufferEncoding } from 'child_process';

const LOGO = ` 
  DDDDD   EEEEEEE EEEEEEE PPPPPP     MM    MM  OOOOO  VV     VV EEEEEEE 
  DD  DD  EE      EE      PP   PP    MMM  MMM OO   OO VV     VV EE      
  DD   DD EEEEE   EEEEE   PPPPPP     MM MM MM OO   OO  VV   VV  EEEEE   
  DD   DD EE      EE      PP         MM    MM OO   OO   VV VV   EE      
  DDDDDD  EEEEEEE EEEEEEE PP         MM    MM  OOOO0     VVV    EEEEEEE 
`;

const VARIANT_CHOICES_APTOS = [
    {
        name: 'A simple hello contract',
        value: 'hello',
        module_name: 'hello'
    },
];

async function main() {
    console.log();

    const localArgs = arg({
        '--type': String,
        '--chain': String,
    });

    const desiredProjectName: string =
        localArgs._[0] ||
        (
            await inquirer.prompt({
                name: 'name',
                message: 'Project name: ',
            })
        ).name.trim();

    const projectPath = path.resolve(desiredProjectName);

    const name = path.basename(projectPath);

    if (name.length === 0) throw new Error('Cannot initialize a project with an empty name');

    let VARIANT_CHOICES = VARIANT_CHOICES_APTOS;

    const argsVariant =
        VARIANT_CHOICES.map(e => e.value).indexOf(localArgs['--type'] || '') !== -1
            ? localArgs['--type']
            : undefined;

    const variant: string =
        argsVariant ||
        (
            await inquirer.prompt([
                {
                    name: 'variant',
                    message: 'Choose the project template: ',
                    type: 'list',
                    choices: VARIANT_CHOICES,
                },
            ])
        ).variant;

    let module_name = "";
    VARIANT_CHOICES.forEach(function (v) {
        if (v.value == variant) {
            module_name = v.module_name;
        }
    })

    await fs.mkdir(projectPath, {
        recursive: true,
    });

    const steps = 3;

    let chain: string = "aptos";

    console.log(`\n[1/${steps}] Copying files...`);

    let basePath = path.join(__dirname, 'template', chain, variant);
    basePath = basePath.replace(/\\/g, "/")

    let files = readDirDeepSync(basePath, { gitignore: false, ignore: [] });

    if (chain == "aptos") {
        files.forEach(function (source_file) {
            let source = fs.readFileSync(source_file).toString();
            source = source.replace(/\{\{package\}\}/g, desiredProjectName);
            source = source.replace(/\{\{module\}\}/g, module_name);
            source = source.replace(/\{\{COIN_TYPE\}\}/g, module_name.toUpperCase());

            let relativePath = source_file.replace(basePath + "/", "");
            let targetPath = path.join(projectPath, relativePath);
            let targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirpSync(targetDir);
            }

            fs.writeFileSync(targetPath, source);
        });
    }

    console.log(`[2/${steps}] Installing dependencies...\n`);

    const execOpts: ExecSyncOptionsWithBufferEncoding = {
        stdio: 'inherit',
        cwd: projectPath,
    };

    const pkgManager = (process.env.npm_config_user_agent ?? 'npm/').split(' ')[0].split('/')[0];

    try {
        switch (pkgManager) {
            case 'yarn':
                execSync('yarn', execOpts);
                break;
            case 'pnpm':
                execSync('pnpm install', execOpts);
                break;
            case 'bun':
                execSync('bun install', execOpts);
                break;
            default:
                execSync('npm install --ignore-scripts', execOpts);
                break;
        }
    } catch (e) {
        console.error('Failed to install nodejs packages :', (e as any).toString());
    }

    try {
        execSync('git init', execOpts);
    } catch (e) {
        console.error('Failed to initialize git repository:', (e as any).toString());
    }

    process.env.CURRENT_CHAIN = chain;

    let test_flag = "--test";
    if (chain == "aptos") {
        test_flag = "";
    }

    execSync(`deepmove-bin deps init --chain=${chain}`, execOpts);

    execSync(`deepmove-bin move build ${test_flag} --chain=${chain}`, execOpts);

    execSync(`deepmove-bin gen test --chain=${chain}`, execOpts);

    console.log(`Success!`);
    console.log(chalk.blueBright(LOGO));
    console.log(chalk.blue(`                                     Move development for professionals`));
    console.log(``);
    console.log(`Your new project is ready, available commands:`);
    console.log(``);
    console.log(chalk.greenBright(` >  `) + chalk.cyanBright(`cd ${desiredProjectName}`));
    console.log(` change directory to your new project`);
    console.log(``);
    console.log(chalk.greenBright(` >  `) + chalk.cyanBright(`deepmove -c ${chain}`));
    console.log(` into deepmove Interactive Client`);
    console.log(``);
    console.log(chalk.greenBright(` >  `) + chalk.cyanBright(`move build ${test_flag}`));
    console.log(` build move`);
    console.log(``);
    console.log(chalk.greenBright(` >  `) + chalk.cyanBright(`test`));
    console.log(` run move typescript unit tests`);
    console.log(``);
}

main().catch(console.error);
