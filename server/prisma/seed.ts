import 'dotenv/config'
import {PrismaPg} from '@prisma/adapter-pg'
import {PrismaClient} from '@prisma/client'

const adapter = new PrismaPg({connectionString : process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})

async function seed(){
    await prisma.user.createMany( { 
        data:[
            {name:'krish gupta', email:'krish@example.com'},
            {name:'aman gupta', email:'krish@example.com'} 
        ] }
    )
}