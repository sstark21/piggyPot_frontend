import styles from "./page.module.css";
import LoginButton from "@/components/ui/loginButton";

export default function Home() {
  return (
      <div className={styles.page}>
          <main className={styles.main}>
              <LoginButton />
          </main>
      </div>
  );
}
