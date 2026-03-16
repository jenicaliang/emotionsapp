import { motion } from "motion/react";
import imgUntitledDesign301 from "../../assets/efde241f341d28e82ad8ca6f89dc5387c3b6c4db.png";;

export function AnimatedLogo() {
  return (
    <div className="relative h-[48px] w-[113.471px]">
      {/* Solid text "CANDID" - fades in and out */}
      <motion.p
        className="absolute font-['ABC_Connect_Unlicensed_Trial:Nail',sans-serif] leading-[42px] left-0 not-italic text-[#5a5a5a] text-[34px] top-[5.56px] tracking-[-1px] whitespace-nowrap"
        // animate={{
        //   opacity: [1, 0, 0, 0, 1],
        // }}
        // transition={{
        //   duration: 10,
        //   repeat: Infinity,
        //   ease: "easeInOut",
        //   times: [0, 0.25, 0.5, 0.75, 1],
        // }}
      >
        Presents
      </motion.p>

      {/* Background text "CANDID" for overlay state */}
      <motion.p
        className="absolute font-['ABC_Connect_Unlicensed_Trial:Nail',sans-serif] leading-[42px] left-0 not-italic text-[rgba(0,0,0,0.14)] text-[34px] top-[5.56px] tracking-[-1px] whitespace-nowrap"
        animate={{
          opacity: [0, 0.14, 0.14, 0.14, 0],
        }}
        // transition={{
        //   duration: 10,
        //   repeat: Infinity,
        //   ease: "easeInOut",
        //   times: [0, 0.25, 0.5, 0.75, 1],
        // }}
      >
        Presents
      </motion.p>

      {/* Animated overlay image - fades in and out */}
      {/* <motion.div
        className="absolute h-[47px] left-0 top-[0.56px] w-[113.471px]"
        animate={{
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt="Gestur Logo"
            className="absolute h-[1138.57%] left-[-90.53%] max-w-none top-[-560%] w-[364.49%]"
            src={imgUntitledDesign301}
          />
        </div>
      </motion.div> */}
    </div>
  );
}