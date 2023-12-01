import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
    const isAuthenticated = false;

    return (
        <>
            {isAuthenticated ? (            // kimlik dogrulanırsa
                <Navigate to="/" />         // home sayfasına
            ) : (
                <>
                    <section className="flex flex-1 justify-center items-center flex-col py-10">
                        <Outlet />          {/* kimlik dogrulanmazsa kaydol, oturum ac bulunan sayfa */}
                    </section>

                    <img
                        src="/assets/images/side-img.svg"
                        alt="logo"
                        className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
                    />

                </>
            )}
        </>
    )
}

export default AuthLayout