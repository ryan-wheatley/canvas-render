import styles from "./page.module.scss";
import PreviewPanel from "@/app/components/PreviewPanel/PreviewPanel";
import SideBar from "@/app/components/SideBar/SideBar";

export default function Home() {
  return (
    <main className={styles.main}>
      <PreviewPanel />
      <SideBar />
    </main>
  );
}
