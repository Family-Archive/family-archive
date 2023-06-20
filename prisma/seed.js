const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const family = await prisma.family.create({
        data: {
            name: "Default"
        }
    })

    await prisma.pronounSet.create({
        data: {
            subject: 'he',
            object: 'him',
            possessive: 'his',
            familyId: family.id
        }
    })

    await prisma.pronounSet.create({
        data: {
            subject: 'she',
            object: 'her',
            possessive: 'hers',
            familyId: family.id
        }
    })

    await prisma.pronounSet.create({
        data: {
            subject: 'they',
            object: 'them',
            possessive: 'theirs',
            familyId: family.id
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect()
        process.exit(1)
    })