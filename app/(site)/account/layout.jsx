import AccountLayout from "@/components/account/AccountLayout";

export const metadata = {
  title: "My Account | Q-bambi Strands",
  description:
    "Manage your appointments, orders, payments, refunds and profile.",
};

export default function Layout({ children }) {
  return <AccountLayout>{children}</AccountLayout>;
}
