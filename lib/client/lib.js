// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
const convertBytesToUnit = (bytes) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const decimals = 2
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

const renderIconFromData = (iconData) => {
    let recordIcon
    if (iconData.type === 'svg') {
        recordIcon = <div dangerouslySetInnerHTML={{ __html: iconData.content }} />
    } else {
        recordIcon = <span className='material-icons'>{iconData.content}</span>
    }
    return recordIcon
}

const renderSingleDate = (date, time = false) => {
    date = new Date(date)
    let offset = date.getTimezoneOffset() * 60000;
    date = new Date(date.valueOf() + offset);

    if (time) {
        return date.toLocaleString()
    }
    return date.toLocaleDateString()
}

const renderDate = (startdate, enddate, unit) => {
    startdate = parseInt(startdate)
    enddate = parseInt(enddate)

    let start = new Date(startdate)
    let offset = start.getTimezoneOffset() * 60000;
    start = new Date(start.valueOf() + offset);

    let end = new Date(enddate)
    offset = end.getTimezoneOffset() * 60000;
    end = new Date(end.valueOf() + offset);

    let dateOpts = { year: "numeric" }
    if (unit == 'months' || unit == 'days') {
        dateOpts.month = 'long'
        if (unit === 'days') {
            dateOpts.day = 'numeric'
        }
    }

    let startString
    if (start.getMinutes() === 0 && start.getHours() === 0) {
        startString = start.toLocaleDateString('en-us', dateOpts)
    } else {
        startString = start.toLocaleTimeString('en-us', dateOpts)
    }
    let string = startString

    if (enddate && enddate != startdate) {
        let endString = end.toLocaleDateString('en-us', dateOpts)
        string = `${string}–${endString}`
    }

    return string
}

const renderNickname = person => {
    if (
        person.Nickname &&
        person.Nickname[0] &&
        person.Nickname[0].name
    ) {
        return person.Nickname[0].name
    }

    return person.fullName
}

const clientLib = {
    convertBytesToUnit: convertBytesToUnit,
    renderIconFromData: renderIconFromData,
    renderDate: renderDate,
    renderSingleDate: renderSingleDate,
    renderNickname: renderNickname
}

export default clientLib