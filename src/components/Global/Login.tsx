import { Icon } from "@iconify/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginSociety } from "@/api/authApi";
import { updateMetadata } from "@/utils/metadata";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

type FormData = z.infer<typeof schema>;

const decodeJWT = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};

const Login = () => {
  const helpdeskEmail = "helpdesk@nexterday.com";
  const [clicked, setClicked] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    updateMetadata({
      title: "Login",
      description: "Login to Nexturday Admin Dashboard",
      keywords: "login, admin, nexturday, dashboard",
    });
  }, []);

  const handleLogin: SubmitHandler<FormData> = async (data) => {
    setClicked(true);
    setErrorMessage("");
    try {
      const response = await loginSociety(data);
      if (response.status === 201) {
        const token = response.data.data.accessToken;
        login(token);

        const decodedToken = decodeJWT(token);
        if (decodedToken.role === "ADMIN") {
          navigate("/master-admin", { replace: true });
        } else {
          const from = (location.state as any)?.from?.pathname || "/update-profile";
          navigate(from, { replace: true });
        }
      } else {
        console.error("Error logging in");
        setErrorMessage("Some error occurred. Try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Some error occurred. Try again.");
    } finally {
      setClicked(false);
    }
  };

  return (
    <>
      <div className="flex h-svh w-screen justify-center items-center font-monaSans">
        <div className="md:w-[55%]">
          <div className="p-6 md:min-w-80 md:max-w-[600px] m-auto">
            <h1 className="font-bold text-3xl pb-2 leading-8">
              Login to your account
            </h1>
            <form
              onSubmit={handleSubmit(handleLogin)}
              className="py-9 font-semibold"
            >
              <div className="flex flex-col gap-6 pb-5">
                <div>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Email address"
                    className="w-full border border-t-0 border-l-0 border-r-0 pb-2 outline-none focus:border-b-gray-400 transition-all"
                  />
                  {errors.email?.message && (
                    <p className="font-normal text-sm text-red-500 pt-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex gap-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Password"
                      className="w-full border border-t-0 border-l-0 border-r-0 pb-2 outline-none focus:border-b-gray-400 transition-all"
                    />
                    <div
                      className="flex justify-center items-center"
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                    >
                      {!showPassword ? (
                        <Icon
                          icon="mage:eye"
                          width="22"
                          height="22"
                          style={{ color: "#9ca3af" }}
                        />
                      ) : (
                        <Icon
                          icon="mage:eye-off"
                          width="22"
                          height="22"
                          style={{ color: "#9ca3af" }}
                        />
                      )}
                    </div>
                  </div>
                  {errors.password?.message && (
                    <p className="font-normal text-sm text-red-500 pt-2">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-sm pt-6 font-normal text-slate-500">
                    Forgot password? Contact{" "}
                    <a href={`mailto:${helpdeskEmail}`} className="underline">Helpdesk</a> to
                    retreive it.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-blue-500 text-white p-2 rounded-md active:bg-blue-600 active:scale-95 transition-all"
                disabled={clicked}
              >
                {clicked ? (
                  <div>
                    <svg
                      className="animate-spin h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : (
                  <span className="flex justify-center items-center">
                    Next
                    <Icon
                      icon="uim:angle-right"
                      width="24"
                      height="24"
                      style={{ color: "#fff" }}
                    />
                  </span>
                )}
              </button>
              <div className="text-red-500 m-auto w-fit pt-3">
                {errorMessage}
              </div>
            </form>
          </div>
        </div>
        <div className="hidden md:block h-full w-[45%] p-6 pl-0">
          <div className="bg-blue-500 h-full w-full rounded-xl"></div>
        </div>
      </div>
    </>
  );
}

export default Login;
