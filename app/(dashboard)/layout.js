import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import NavBar from "@/components/NavBar/NavBar"

const DashboardLayout = async ({ children }) => {
    // For every page under the "Dashboard," redirect back home if the user isn't logged in
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/')
    }

    return (
        <main>
            <NavBar />
            <div className='page'>
                {children}
            </div>
        </main>
    )
}

export default DashboardLayout
