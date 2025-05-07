"use client"

import { ClerkAPIError } from "@/types/clerk";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { signUpSchema } from "../schemas/signUpSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { handleSubmit, register, formState: { errors } } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    }
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })

      setVerifying(true);
    } catch (error: unknown) {
      const clerkError = error as ClerkAPIError;
      console.log("Signup error", error);
      setAuthError(clerkError.errors?.[0]?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;
    
    setIsSubmitting(true);
    setVerificationCodeError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode 
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log("Verification failed", result);
        setVerificationCodeError("Invalid verification code");
      }
    } catch (error: unknown) {
      const clerkError = error as ClerkAPIError;
      console.log("Verification error", error);
      setAuthError(clerkError.errors?.[0]?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/airdroplogo.svg"
              alt="Air Drop Logo"
              width={56}
              height={56}
              className="logo-glow"
              priority
            />
          </div>
          <h1 className="text-2xl font-medium text-white mb-1">Verify your email</h1>
          <p className="text-gray-400">We've sent a verification code to your email</p>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700">
          {verificationCodeError && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{verificationCodeError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-5">
            {/* Verification Code Field */}
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-300"
              >
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-gray-500 text-center text-lg tracking-wider"
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/airdroplogo.svg"
            alt="Air Drop Logo"
            width={56}
            height={56}
            className="logo-glow"
            priority
          />
        </div>
        <h1 className="text-2xl font-medium text-white mb-1">Create your account</h1>
        <p className="text-gray-400">to start using Air Drop</p>
      </div>

      {/* Form Container */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700">
        {authError && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className={`w-full pl-10 pr-3 py-2 bg-gray-900/50 border ${
                  errors.email ? "border-red-500" : "border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-gray-500`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2 bg-gray-900/50 border ${
                  errors.password ? "border-red-500" : "border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-gray-500`}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2 bg-gray-900/50 border ${
                  errors.passwordConfirmation ? "border-red-500" : "border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-gray-500`}
                {...register("passwordConfirmation")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-red-500 text-xs mt-1">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
