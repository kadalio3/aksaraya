import { auth } from "@/lib/auth";
import { getStudioUrl } from "@/lib/studio";
import { Navbar as NavbarClient } from "./navbar";

export async function NavbarServer() {
    const session = await auth();
    const studioUrl = await getStudioUrl();

    return <NavbarClient user={session?.user} studioUrl={studioUrl} />;
}
