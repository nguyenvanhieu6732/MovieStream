// app/page.tsx
import HomePageServer from "./home/page";
import ScrollRestore from "@/components/scrollEffect/ScrollRestore";

export default function HomePage() {
  return (
    <>
      <ScrollRestore storageKey="home-scroll">
        <HomePageServer />
      </ScrollRestore>
    </>
  );
}
