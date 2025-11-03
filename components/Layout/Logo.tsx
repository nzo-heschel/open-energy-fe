import Image from 'next/image';



export default function Logo() {
  return (
    <div
      className="flex items-center cursor-pointer"
    >
      <Image
        src="/Frame 427319881.png"
        alt="NZO Logo"
        width={140}
        height={56}
        className="md:h-[56px] md:w-[140px] h-auto w-[60px]"
        priority
      />
    </div>
  );
}