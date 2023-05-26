import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import NavBar from "@/components/NavBar/NavBar"

const DashboardLayout = async ({ children }) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/')
    }

    return (
        <main>
            {session ? <NavBar /> : ''}
            <div className='page'>
                {children}
            </div>
        </main>
    )
}

export default DashboardLayout
