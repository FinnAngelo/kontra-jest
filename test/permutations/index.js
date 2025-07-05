// this file takes a very long time to run as it tests each permutation of the different objects preprocess options. only run this test for prs.

const fs = require('fs');
const pp = require('preprocess');
const path = require('path');
const execSync = require('child_process').execSync;
const rollup = require('rollup');

let options = {
  updatable: [
    'GAMEOBJECT_VELOCITY',
    'GAMEOBJECT_ACCELERATION',
    'GAMEOBJECT_TTL',
    'VECTOR_SCALE'
  ],
  gameObject: [
    'GAMEOBJECT_ANCHOR',
    'GAMEOBJECT_GROUP',
    'GAMEOBJECT_OPACITY',
    'GAMEOBJECT_RADIUS',
    'GAMEOBJECT_ROTATION',
    'GAMEOBJECT_SCALE'
  ],
  sprite: ['SPRITE_IMAGE', 'SPRITE_ANIMATION', 'GAMEOBJECT_RADIUS'],
  text: [
    'TEXT_AUTONEWLINE',
    'TEXT_NEWLINE',
    'TEXT_RTL',
    'TEXT_ALIGN',
    'TEXT_STROKE'
  ],
  tileEngine: [
    'TILEENGINE_CAMERA',
    'TILEENGINE_DYNAMIC',
    'TILEENGINE_QUERY'
  ],
  vector: [
    'VECTOR_ANGLE',
    'VECTOR_CLAMP',
    'VECTOR_DIRECTION',
    'VECTOR_DISTANCE',
    'VECTOR_DOT',
    'VECTOR_LENGTH',
    'VECTOR_NORMALIZE',
    'VECTOR_SCALE',
    'VECTOR_SUBTRACT'
  ]
};

let dependants = {
  tileEngine: ['GAMEOBJECT_ANCHOR']
};

// run permutations in parallel by passing in which permutation suite to run
const optionName = process.argv.slice(2)[0];
if (optionName && options[optionName]) {
  options = {
    [optionName]: options[optionName]
  };
}

Object.keys(options).forEach(async option => {
  try {
    // generate each option and run tests
    let numPermutations = 2 ** options[option].length;
    for (let i = 0; i < numPermutations; i++) {
      let context = {};

      if (dependants[option]) {
        dependants[option].forEach(contextName => {
          context[contextName] = true;
        });
      }

      options[option].forEach((optionName, index) => {
        context[optionName] = !!((2 ** index) & i);
      });

      // Create a temporary directory for this permutation
      let permutationDir = path.join(__dirname, `${option}-${i}`);
      if (!fs.existsSync(permutationDir)) {
        fs.mkdirSync(permutationDir);
      }

      // Create a src directory for preprocessed source files
      let srcDir = path.join(permutationDir, 'src');
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir);
      }

      // Copy and preprocess all source files
      let srcFiles = fs.readdirSync(path.join(__dirname, '../../src'));
      srcFiles.forEach(file => {
        if (file.endsWith('.js')) {
          let srcContent = fs.readFileSync(
            path.join(__dirname, `../../src/${file}`),
            'utf-8'
          );
          let processedContent = pp.preprocess(srcContent, context, {
            type: 'js'
          });
          fs.writeFileSync(
            path.join(srcDir, file),
            processedContent,
            'utf-8'
          );
        }
      });

      // get the setup code
      let setup = fs.readFileSync(
        path.join(__dirname, '../setup.js'),
        'utf-8'
      );
      // Update setup code to use the preprocessed source files
      setup = setup.replaceAll('../src/', `./${option}-${i}/src/`);

      // copy test suite and change path to use preprocessed source
      let test = fs.readFileSync(
        path.join(__dirname, `../unit/${option}.spec.js`),
        'utf-8'
      );
      // Update test imports to use the preprocessed source files
      test = test.replaceAll('../../src/', `./${option}-${i}/src/`);

      // since loading the setup code causes the core file to be loaded
      // twice (and destroying context references) we'll need to inject
      // the setup code into each test suite manually
      let matches = test.match(/(import.*?from.*?[\n\r])/g);
      let lastImport = matches[matches.length - 1];
      test = test.replace(lastImport, `${lastImport}${setup}`);

      // replace context in test suite
      let testContents = test.replace(
        /\/\/ test-context([\s\S])*\/\/ test-context:end/,
        `let testContext = ${JSON.stringify(context)};`
      );

      let contents = pp.preprocess(testContents, context, {
        type: 'js'
      });
      
      // Write the processed test file
      fs.writeFileSync(
        path.join(__dirname, `${option}-${i}.spec.js`),
        contents,
        'utf-8'
      );

      // Run Jest with the main configuration but allow it to find the file
      execSync(
        'npx jest --testTimeout=30000 --maxWorkers=1 --collectCoverage=false --testPathPatterns="' + path.join(__dirname, `${option}-${i}.spec.js`).replace(/\\/g, '/') + '"',
        {
          stdio: 'inherit',
          cwd: path.join(__dirname, '../..')
        }
      );

      // Clean up the temporary directory and test file
      fs.rmSync(permutationDir, { recursive: true, force: true });
      fs.unlinkSync(path.join(__dirname, `${option}-${i}.spec.js`));
    }
  } catch (e) {
    // for some reason a failing test/exec does not error the program
    console.log(e);
    return process.exit(1);
  }
});
