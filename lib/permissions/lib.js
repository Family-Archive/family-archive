import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/db/prisma';

/**
 * This function checks if a user should be able to access a resource.
 * At the moment it just checks if the user belongs to the same family as the resource, but could be extended later
 * for a more complex permission system.
 * @param {string} userId: The ID of the user
 * @param {string} resourceName: The name of the resource. This must match a table name in Prisma
 * @param {string} resourceId: The ID of the resource
 * @param {string} action: The ID of the resource
 */
const checkPermissions = async (userId, resourceName, resourceId, action) => {
    // If the user is an admin, they can do everything
    if (await userIsAdmin(userId)) {
        return true
    }

    // if the user isn't an admin and doesn't belong to the resource's family, deny them
    // if (!(await checkIfUserInResourceFamily(userId, resourceName, resourceId))) {
    //     return false
    // }

    // check if user is creator (need to add column to all resource tables)

    // check collection permissions (yucky recursion)

    let permissionRecords = await prisma.Permission.findMany({
        where: {
            resourceId: resourceId
        }
    })
    console.log(permissionRecords)

    return checkIfUserInResourceFamily(userId, resourceName, resourceId)
}

const checkIfUserIsCreator = async (userId, resourceName, resourceId) => {
    // Fetch the resource
    let resource = await prisma[resourceName].findUnique({
        where: {
            id: resourceId
        }
    })
}

const checkIfUserInResourceFamily = async (userId, resourceName, resourceId) => {
    // Fetch the user and their families
    let user = await prisma.User.findUnique({
        where: {
            id: userId
        },
        include: {
            families: true
        }
    })

    // Fetch the resource
    let resource = await prisma[resourceName].findUnique({
        where: {
            id: resourceId
        }
    })

    // Check if any of the user's families match that of the record
    let userBelongsToResourceFamily = false
    for (let family of user.families) {
        if (family.id === resource.familyId) {
            userBelongsToResourceFamily = true
        }
    }

    return userBelongsToResourceFamily
}

/**
 * Determine if a user is an admin or not
 * @param {string} userId: Optional User ID. If passed, will query the database directly. Otherwise, will use session information
 * @returns {boolean}: If the user is an admin or not
 */
const userIsAdmin = async (userId = null) => {
    let isAdmin = false
    if (userId) {
        let user = await prisma.User.findUnique({
            where: { id: userId }
        })
        isAdmin = user.isAdmin
    } else {
        const session = await getServerSession(authOptions);
        isAdmin = session?.user.isAdmin || false
    }

    return isAdmin
}

const permissionLib = {
    checkPermissions: checkPermissions,
    userIsAdmin: userIsAdmin
}

export default permissionLib