const { exec } = require("child_process");

console.log("Running from non-global electron...")
exec("node ./node_modules/electron/cli.js .", (error, stdout, stderr) => {
    if (error) {
        console.log("Non global electron not installed, running from global electron...")
        exec("electron .", (err, serr, sout) => {
            if(err) {
                console.log(`Whops, it looks like cannot run because of:\n${err}`)
                process.exit(1)
            } else if (serr) {
                console.log(`Whops, it looks like cannot run because of:\n${serr}`)
                process.exit(1)
            } else {
                console.log(sout)
            }
        })
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(stdout);
});