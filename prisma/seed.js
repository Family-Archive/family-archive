const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    await prisma.pronounSet.create({
        data: {
            subject: 'he',
            object: 'him',
            possessive: 'his'
        }
    })

    await prisma.pronounSet.create({
        data: {
            subject: 'she',
            object: 'her',
            possessive: 'hers'
        }
    })

    await prisma.pronounSet.create({
        data: {
            subject: 'they',
            object: 'them',
            possessive: 'theirs'
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