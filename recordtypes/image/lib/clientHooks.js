"use client"

function afterFieldChanged(fields, setFields) {
    console.log('afterFieldChanged')
    // let updatedFields = fields
    // updatedFields[0].value = 'From hook!'
    // setFields(updatedFields)
}

module.exports = {
    afterFieldChanged: afterFieldChanged
}