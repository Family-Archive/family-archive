import Form from '@/components/Form/Form'
import lib from '@/lib/lib'

/**
 * This page displays all of the users in the system
 */

const authPage = async () => {

    const allowSelfRegistration = await lib.getSetting('allowselfregistration')
    const requireEmailVerification = await lib.getSetting('requireemailverification')

    return <div className={`column`}>
        <h1 className='title'>Authentication options</h1>
        <Form
            method="POST"
            action={`/api/settings/`}
            fields={[
                {
                    name: 'allowselfregistration',
                    label: 'Allow new users to self-register',
                    type: 'Selector',
                    value: {
                        options: [
                            { name: 'Yes', value: 'yes' },
                            { name: 'No', value: 'no' },
                        ],
                        defaultOption: allowSelfRegistration === 'yes' ? 'yes' : 'no'
                    }
                },
                {
                    name: 'requireemailverification',
                    label: 'Require users to verify their email before accessing the site?',
                    type: 'Selector',
                    value: {
                        options: [
                            { name: 'Yes', value: 'yes' },
                            { name: 'No', value: 'no' },
                        ],
                        defaultOption: requireEmailVerification === 'no' ? 'no' : 'yes'
                    }
                }
            ]}
            allowFileUpload={false}
        />
    </div>
}

export default authPage