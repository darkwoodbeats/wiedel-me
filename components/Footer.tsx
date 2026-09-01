export default function Footer() {
  return (
    <footer className="border-t border-line pt-[30px] pb-[45px] text-[0.85rem] text-[#777d89]">
      <div className="mx-auto flex w-[min(100%-40px,var(--container-site))] flex-col justify-between gap-5 sm:flex-row">
        <span>© {new Date().getFullYear()} Wiedel. Built with intent.</span>
        <span>Web · Design · IT · Music</span>
      </div>
    </footer>
  );
}
