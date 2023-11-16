import { redirect } from 'next/navigation';
import authLib from "@/lib/auth/lib";

const verifyEmailPage = async ({ params }) => {

    if (!(await authLib.verifyUser(params.token))) {
        redirect('/auth/login')
    }

    return <div>
        Your email has been verified!
    </div>
}

export default verifyEmailPage