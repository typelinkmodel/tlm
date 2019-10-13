const common = [
    'features/**/*.feature',
    '--require-module ts-node/register',
    '--require step-definitions/**/*.ts',
    '--require support/**/*.ts'
].join(' ');

function getWorldParameters(assembly) {
    return "--world-parameters '" + JSON.stringify(
        {
            assembly: assembly
        }) + "'";
}

module.exports = {
    default: common + " " + getWorldParameters("default"),
    pgsql: common + " " + getWorldParameters("pgsql")
};
