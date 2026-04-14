import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Dashboard(){
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`)
    }
    const name = session.user.name

    return(
        <div>GREAT DASHBOARD {name}</div>
    )
}