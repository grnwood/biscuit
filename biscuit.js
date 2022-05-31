const Sitemapper = require('sitemapper')
const http = require('http')
const { nettime, getDuration } = require('nettime')
var colors = require('colors');
var limit = 0
var random = false

if (process.argv.length < 3 ) {
    console.log('biscuit.js')
    console.log('---=======-----')
    console.log('Crawl sitemaps and get some numbers.')
    console.log('')
    console.log("usage: node biscuit.js <url-to-sitemap>")
    console.log('')
    console.log("optional:")
    console.log(" --limit=X\t # limit to X URLs regardless of sitemap entries")
    console.log(" --randomize\t # randomize URLs out of the sitemap")
    console.log(" --user=<user> --password=<pass> if needed.")
    process.exit(1)
}

var siteToCrawl = process.argv[2]
var limitURLs = process.argv[3] != undefined ? process.argv[3]: undefined
var randomURLs = process.argv[4] != undefined ? process.argv[4]: undefined
var user, password

process.argv.forEach(function (value,index) {
    if (value.indexOf('http') >=0) {
        siteToCrawl = value
    }
    if (value.indexOf('--limit')>=0) {
        splitval = limitURLs.split('=')
        if (splitval[1]) {
            limit = Math.floor(splitval[1])
        }
    }
    if (value.indexOf('randomize') >=0) {
        random = true
        console.error("!  Randomize not implemented yet")
        process.exit(1)
    }
    if (value.indexOf('--user') >=0) {
        splitval = value.split('=')
        if (splitval[1]) {
            user = splitval[1]
        }
    }
    if (value.indexOf('--password') >=0) {
        splitval = value.split('=')
        if (splitval[1]) {
            password = splitval[1]
        }
    }
    
})

var waitTotal = 0
var processedTotal = 0
var processed = 0
var errors = 0
var lastone = false

console.log(String("! Parsing sitemap "+siteToCrawl).cyan)

const sitemapper = new Sitemapper({
    url: siteToCrawl,
    timeout: 15000,
    requestHeaders: {
      'Authorization': getCredsBasicAuthHeader(user, password)
    },
    debug: true,
    concurrency: 2,
    retries: 1,
  });

sitemapper.fetch(siteToCrawl).then(function (sites) {

    if (limit) {
        console.log(String("\t\t ! Limiting urls to "+limit+ ' URLs').magenta)
    }

    if (random) {
        console.log('\t\t ! Randomizing sitemap URLs'.magenta);
    }

    if (sites.sites.length <= 0) {
        console.log('!! No biscuits for you...'.red)
        process.exit(1)
    }

    console.log(String("\t\t ! Site has " + sites.sites.length + " urls to warm up ...").cyan)
    if ( limit > 0 && limit < sites.sites.length) {
        // just grab limit for now
        toWorkOn = sites.sites.slice(0,limit)
        processedTotal = limit
        console.log(String("! \t\t\t Limiting to "+limit+" crawls").red)
    } else {
        toWorkOn = sites.sites
        processedTotal = sites.sites.length
    }
    
    console.log("\t! Queueing up URLs.. #".grey)
    toWorkOn.forEach(function(item, index) {
        process.stdout.write("#")
        credentials = {username: user, password: password}

        console.log("*")
        nettime({url: item, followRedirects: true, timeout: 15000, 
            credentials: credentials}).then(result => {
            processResult(item, result)  
        })
        .catch(error =>  { 
            console.error('! '+ item + ': '+ error.message)
            processed += 1
            errors += 1
        }
        )
    })
  
    console.log('! DONE queueing'.green)
    
})

function processResult(item, result) {
    processed += 1
    if (!Array.isArray(result)) {
        toProcess = result
    } else {
        // grab the last redirect
        toProcess = result[result.length - 1]
    }

    //console.log(toProcess)
    console.log(String("! "+item+"\t ("+toProcess.statusCode+"/"+toProcess.statusMessage+")").gray)

    let timings = toProcess.timings
    let waiting = getDuration([0, 0], timings.firstByte)
    waitTotal += nettime.getMilliseconds(waiting)
    let downloading = getDuration(timings.firstByte, timings.contentTransfer)
    //console.log(item)
    console.log('\twt:' + threeDig(nettime.getMilliseconds(waiting)) + 'ms' + '\tdl:' + threeDig(nettime.getMilliseconds(downloading)) + 'ms'
        +'\t\t TOTAL wt '+threeDig(waitTotal)+ '  ('+threeDig(waitTotal/processed)+' avg ms)' + String('\t Count: '+processed + ' of ' +processedTotal).red)

    if (processed >= processedTotal-1) {
        if (!lastone) {
            lastone = true
            console.log('! biscuit is done.'.green)
            console.log(String('\t TOTAL wt: '+threeDig(waitTotal)+ '  ('+threeDig(waitTotal/processed)+' avg ms)' + String('\t Processed Count: '+processedTotal)).cyan)
            console.log(String('! \t\t\t Of ' +processedTotal+' there were ' + errors + ' errors. '+(errors/processedTotal*100)+'% error rate').cyan)
        } else {
            // do nothing, async issue?
        }
        

    }
}

function threeDig(inno) {
    return Number(inno).toFixed(3)
}

function getCredsBasicAuthHeader(user, pass) {
    const token = Buffer
        .from(`${user}:${pass}`)
    .toString('base64')
        return `Basic ${token}`
}