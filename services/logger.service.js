const logsDir = './logs'

//define the time format
function getTime() {
    let now = new Date()
    return now.toLocaleString()
}

function doLog(level, ...args) {
    const strs = args.map(arg => (typeof arg === 'string') ? arg : JSON.stringify(arg))
    var line = strs.join(' | ')
    line = `${getTime()} - ${level} - ${line}\n`
    console.log(line)
}

module.exports = {
    debug(...args) {
        // if (process.env.NODE_NEV === 'production') return
        doLog('DEBUG', ...args)
    },
    info(...args) {
        doLog('INFO', ...args)
    },
    warn(...args) {
        doLog('WARN', ...args)
    },
    error(...args) {
        doLog('ERROR', ...args)
    }
}