import InputForm from "@/app/components/InputForm"
import Logo from "@/app/components/Logo"

export default function Home() {
  return (
    <div className="content-container flex flex-col items-center justify-center min-h-screen">
      <Logo isSmall={false} className="mb-[-2rem]" />
      <div className="z-10 w-full max-w-4xl mx-auto p-8 flex flex-col items-center mt-12">
        <InputForm />
      </div>
    </div>
  )
}

