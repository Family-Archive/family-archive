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
const checkPermissions = async (userId, resourceName, resourceId, action = 'read') => {
    // If the user is an admin, they can do everything
    if (await userIsAdmin(userId)) {
        return true
    }

    // if the user isn't an admin and doesn't belong to the resource's family, deny them
    if (!(await checkIfUserInResourceFamily(userId, resourceName, resourceId))) {
        return false
    }

    // if the user is the creator, they can do whatever
    if (await checkIfUserIsCreator(userId, resourceName, resourceId)) {
        return true
    }

    // Iterate through any relevant permissions and return true if one matches
    let hasPermission = true
    let permissionRecords = await prisma.Permission.findMany({
        where: {
            resourceId: resourceId,
            resourceType: resourceName,
            permission: action
        }
    })
    // With an edit action, permission is granted to a certain user set; with read, permission is RESTRICTED to a user set
    // In other words, the read permission is granted by default but the edit permission is denied
    if (action == 'edit' || (action == 'read' && permissionRecords.length > 0)) {
        hasPermission = false
        for (let permission of permissionRecords) {
            if (permission.userId == userId) {
                hasPermission = true
            }
        }
    }

    // check collection permissions IF there are no explicit permission records on the resource
    // we want to get a list of all collections this record belongs to and call this function on each
    // if any return true, we return true here.
    // what if a record is in a nested collection "2" that is a child of "1," and the user has edit actions on "1,"
    // but no specified permissions on "2" or the record itself? In this case the user would be denied. 

    console.log(resourceName, action, hasPermission)
    return hasPermission
}

const checkIfUserIsCreator = async (userId, resourceName, resourceId) => {
    let resource = await prisma[resourceName].findUnique({
        where: {
            id: resourceId
        }
    })
    return resource.userCreatedId === userId
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