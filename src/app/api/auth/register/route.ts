import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRegistrationBlocked } from "@/lib/blocklist";
import { getClientIp } from "@/lib/request-ip";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, birthDate, password } = body;

        if (!email || !firstName || !lastName || !birthDate || !password) {
            return NextResponse.json(
                { error: "Bitte fülle alle Felder aus." },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 8) {
            return NextResponse.json(
                { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
                { status: 400 }
            );
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== "string" || !emailPattern.test(email)) {
            return NextResponse.json(
                { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const clientIp = getClientIp(req);

        if (await isRegistrationBlocked(normalizedEmail, clientIp)) {
            return NextResponse.json(
                {
                    error: "Eine Registrierung ist mit diesen Daten nicht möglich. Bei Fragen wenden Sie sich bitte an den Support.",
                    code: "REGISTRATION_BLOCKED",
                },
                { status: 403 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Diese E-Mail ist bereits registriert." },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(password, 12);

        await prisma.user.create({
            data: {
                email: normalizedEmail,
                firstName,
                lastName,
                birthDate: new Date(birthDate),
                passwordHash: hashedPassword,
                registrationIp: clientIp,
            },
        });

        return NextResponse.json({ message: "Erfolgreich registriert." });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Interner Serverfehler." },
            { status: 500 }
        );
    }
}
