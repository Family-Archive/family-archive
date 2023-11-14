import Form from "@/components/Form/Form"
import lib from "@/lib/lib"

const mailPage = async () => {

    const smtphost = await lib.getSetting('smtphost')
    const smtpauthtype = await lib.getSetting('smtpauthtype')
    const smtpusername = await lib.getSetting('smtpusername')
    const smtppassword = await lib.getSetting('smtppassword')

    return <div className="column">
        <h1 className="title">Mail settings</h1>
        <Form
            method="POST"
            action={`/api/settings/`}
            fields={[
                {
                    name: 'smtphost',
                    label: 'SMTP host',
                    type: 'text',
                    value: smtphost || ""
                },
                {
                    name: 'smtpauthtype',
                    label: 'Secure',
                    type: 'Selector',
                    value: {
                        options: [
                            { name: 'True', value: 'true' },
                            { name: 'False', value: 'false' },
                        ],
                        defaultOption: smtpauthtype || "false"
                    }
                },
                {
                    name: 'smtpusername',
                    label: 'SMTP Username',
                    type: 'text',
                    value: smtpusername || ""
                },
                {
                    name: 'smtppassword',
                    label: 'SMTP Password',
                    type: 'password',
                    value: smtppassword || ""
                },
            ]}
            allowFileUpload={false}
        />
    </div >
}

export default mailPage