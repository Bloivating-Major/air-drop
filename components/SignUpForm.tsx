"use client"

import { ClerkAPIError } from "@/types/clerk";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

// zod custom schema
import { signUpSchema } from "../schemas/signUpSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from "lucide-react";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@heroui/react";
import Link from "next/link";

// we have to destructure useSignUp hook

export default function SignUpForm() {

    // use router
    const router = useRouter();


    // using state to verify the process and render
    const [verifying, setVerifying] = useState(false);

    // destructuring the useSignUp hook
    const { isLoaded, signUp, setActive } = useSignUp();

    // is submitting
    const [isSubmitting, setIsSubmitting] = useState(false);

    // verification code
    const [verificationCode, setVerificationCode] = useState("");

    // verification code error
    const [verificationCodeError, setVerificationCodeError] = useState<string | null>(null);

    // show password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // auth errors
    const [authError, setAuthError] = useState<string | null>(null);


    // uisng react hook form
    const { handleSubmit, register, formState: { errors } } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        }
    });



    // submitting the form
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if (!isLoaded) return;
        // set submitting
        setIsSubmitting(true);
        // set auth errors
        setAuthError(null);

        // now we will signup
        try {

            // create a new user
            await signUp.create({
                emailAddress: data.email,
                password: data.password,
            })

            // signup 
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })

            // set verifying
            setVerifying(true);
        } catch (error: unknown) {
            const clerkError = error as ClerkAPIError;
            console.log("Signup error", error);
            setAuthError(clerkError.errors?.[0]?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }

    };
    // handling verification submit
    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // if not loaded
        if (!isLoaded || !signUp) return;

        // set submitting
        setIsSubmitting(true);
        // set auth errors
        setAuthError(null);


        // try and catch
        try {
            const result = await signUp.attemptEmailAddressVerification(
                {
                    code: verificationCode 
                }
            )

            // console. the result
            console.log("result", result);

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
            <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
                <CardHeader className="flex flex-col gap-1 items-center pb-2">
                    <h1 className="text-2xl font-bold text-default-900">
                        Verify Your Email
                    </h1>
                    <p className="text-default-500 text-center">
                        We&apos;ve sent a verification code to your email
                    </p>
                </CardHeader>

                <Divider />

                <CardBody className="py-6">
                    {verificationCodeError && (
                        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{verificationCodeError}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerificationSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="verificationCode"
                                className="text-sm font-medium text-default-900"
                            >
                                Verification Code
                            </label>
                            <Input
                                id="verificationCode"
                                type="text"
                                placeholder="Enter the 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Verify Email"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-default-500">
                            Didn&apos;t receive a code?{" "}
                            <button
                                onClick={async () => {
                                    if (signUp) {
                                        await signUp.prepareEmailAddressVerification({
                                            strategy: "email_code",
                                        });
                                    }
                                }}
                                className="text-primary hover:underline font-medium"
                            >
                                Resend code
                            </button>
                        </p>
                    </div>
                </CardBody>
            </Card>
        );
    }


    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold text-default-900">
                    Create Your Account
                </h1>
                <p className="text-default-500 text-center">
                    Sign up to start managing your images securely
                </p>
            </CardHeader>

            <Divider />

            <CardBody className="py-6">
                {authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-default-900"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                            {...register("email")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-default-900"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="passwordConfirmation"
                            className="text-sm font-medium text-default-900"
                        >
                            Confirm Password
                        </label>
                        <Input
                            id="passwordConfirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    type="button"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.passwordConfirmation}
                            errorMessage={errors.passwordConfirmation?.message}
                            {...register("passwordConfirmation")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <p className="text-sm text-default-600">
                                By signing up, you agree to our Terms of Service and Privacy
                                Policy
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
            </CardBody>

            <Divider />

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}