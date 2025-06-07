import { AnimatePresence, motion } from "motion/react";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentStep } from "../../hooks/useCurentStep";
import { STEP_KIND } from "../../utils/steps";
import { StepErrorBoundaryComponent } from "./ErrorBoundary";
import { Navigation } from "./Navigation";

export const modalContext = createContext({
  showModal: () => {},
  closeModal: () => {},
});

export const Modal = ({
  children,
  overlays,
}: {
  children: React.ReactNode;
  overlays?: React.ReactNode;
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const showModal = useCallback(() => {
    modalRef.current?.showModal();
  }, [modalRef]);

  const closeModal = useCallback(() => {
    modalRef.current?.close();
  }, [modalRef]);

  useEffect(() => {
    showModal();
  }, [showModal]);
  const { currentStep } = useCurrentStep();
  const [isWelcome, setIsWelcome] = useState(false);
  const [isSuccessStep, setIsSuccessStep] = useState(false);
  const [isTokenList, setIsTokenList] = useState(false);
  const [isTradeStep, setIsTradeStep] = useState(false);
  useEffect(() => {
    setIsWelcome(currentStep?.kind === STEP_KIND.WELCOME);
    setIsSuccessStep(currentStep?.kind === STEP_KIND.SUCCESS);
    setIsTokenList(currentStep?.kind === STEP_KIND.TOKEN_LIST);
    setIsTradeStep(currentStep?.kind === STEP_KIND.TRADE);
  }, [currentStep?.kind]);

  const [descClass, setDescClass] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    setDescClass("out");

    setTimeout(() => {
      setDescClass("in");
      setDescription(currentStep?.description || "");
    }, 300);
  }, [currentStep?.description]);

  return (
    <dialog className="modal" ref={modalRef}>
      {/* Simplified Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-deep-black-950 to-black opacity-95" />

      {/* Main Modal Container - Fullscreen */}
      <div
        className="modal-box bg-black backdrop-blur-sm rounded-none border-0 shadow-2xl shadow-neon-green-500/25 relative overflow-hidden w-screen h-screen max-w-none max-h-none"
      >
        {/* Overlays (e.g., TweetModal) */}
        {overlays}

        {/* Content Container */}
        <motion.div
          className={`relative z-10 flex flex-col h-full ${
            isTokenList ? "p-0 -mt-2" : "justify-between p-4"
          }`}
          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.3, rotateY: -180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
        >
          {/* Navigation with Glow */}
          <motion.div
            className={isTokenList ? "px-4 pb-1" : ""}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Navigation />
          </motion.div>

          <ErrorBoundary FallbackComponent={StepErrorBoundaryComponent}>
            {/* Header Icon with Epic Effects - 只在非TokenList和非Trade時顯示 */}
            <AnimatePresence>
              {currentStep?.headerIcon && !isTokenList && !isTradeStep && (
                <motion.div
                  className="relative flex justify-center items-center"
                  initial={{ opacity: 0, scale: 0.1, y: -100 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.1, y: 100 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    duration: 0.6,
                  }}
                >
                  {/* Glow Effect Behind Icon */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.img
                    src={currentStep?.headerIcon}
                    alt="Step Icon"
                    className="relative w-[282px] h-[150px] drop-shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isTokenList ? (
              /* Token List Page Layout */
              <div className="flex flex-col h-full">
                {/* Compact Header for Token List */}
                <div className="px-4 py-2 bg-gradient-to-r from-deep-black-950/90 to-black/90 backdrop-blur-sm border-b border-neon-green-500/20">
                  {/* Game Title */}
                  {currentStep?.gameTitle && (
                    <motion.div
                      className="text-center mb-1"
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <motion.h2
                        className="text-xl font-bold text-transparent bg-gradient-to-r from-neon-green-300 via-neon-green-500 to-neon-green-400 bg-clip-text tracking-wider font-capsula"
                        animate={{
                          textShadow: [
                            "0 0 10px #00ff7f",
                            "0 0 20px #00ff7f", 
                            "0 0 15px #00ff7f",
                            "0 0 10px #00ff7f",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentStep.gameTitle}
                      </motion.h2>
                    </motion.div>
                  )}

                  {/* Main Title */}
                  {currentStep?.title && (
                    <motion.h3
                      className={`text-center text-3xl font-bold text-neon-green-500 drop-shadow-lg mb-1 font-capsula ${descClass}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      style={{
                        textShadow:
                          "0 0 20px rgba(0, 255, 127, 0.8), 0 0 40px rgba(0, 255, 127, 0.4)",
                      }}
                    >
                      {currentStep?.title}
                    </motion.h3>
                  )}

                  {/* Description */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p
                      className={`text-neon-green-300 leading-relaxed ${descClass} text-base font-capsula`}
                    >
                      {description}
                    </p>
                  </motion.div>
                </div>

                {/* Full-height Content */}
                <motion.div
                  className="flex-1 overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <modalContext.Provider value={{ showModal, closeModal }}>
                    {children}
                  </modalContext.Provider>
                </motion.div>
              </div>
            ) : (
              /* Regular Modal Layout */
              <div
                className={`flex-col flex gap-6 justify-center mb-2 w-full ${
                  isTradeStep ? "flex-1 min-h-0" : "h-[284px]"
                }`}
              >
                {/* Game Title with Glitch Effect */}
                {currentStep?.gameTitle && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <motion.h2
                      className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 bg-clip-text tracking-wider"
                      animate={{
                        textShadow: [
                          "0 0 10px #00ffff",
                          "0 0 20px #ffff00",
                          "0 0 10px #ff00ff",
                          "0 0 10px #00ffff",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {currentStep.gameTitle}
                    </motion.h2>
                  </motion.div>
                )}

                {/* Main Title with Epic Typography */}
                {currentStep?.title && (
                  <motion.h3
                    className={`text-center text-2xl font-bold text-white drop-shadow-lg ${descClass}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      textShadow:
                        "0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)",
                    }}
                  >
                    {currentStep?.title}
                  </motion.h3>
                )}

                {/* Description with Gaming Flair */}
                {!isTradeStep && (
                  <motion.div
                    className="text-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p
                      className={`text-gray-300 leading-relaxed ${descClass} text-lg`}
                    >
                      {description}
                    </p>
                  </motion.div>
                )}

                {/* Trade時的簡化描述 */}
                {isTradeStep && (
                  <motion.div
                    className="text-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p
                      className={`text-gray-300 leading-relaxed ${descClass} text-sm`}
                    >
                      {description}
                    </p>
                  </motion.div>
                )}

                {/* Content with Slide-in Effect */}
                <motion.div
                  className={isTradeStep ? "flex-1 overflow-auto" : ""}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <modalContext.Provider value={{ showModal, closeModal }}>
                    {children}
                  </modalContext.Provider>
                </motion.div>
              </div>
            )}
          </ErrorBoundary>
        </motion.div>

        {/* Corner Decorations - Hide for Token List */}
        {!isTokenList && (
          <>
            <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-neon-green-500 opacity-80 shadow-lg shadow-neon-green-500/50" />
            <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-neon-green-500 opacity-80 shadow-lg shadow-neon-green-500/50" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-neon-green-500 opacity-80 shadow-lg shadow-neon-green-500/50" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-neon-green-500 opacity-80 shadow-lg shadow-neon-green-500/50" />
          </>
        )}
      </div>
    </dialog>
  );
};
