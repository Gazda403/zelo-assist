import { Composition } from 'remotion';
import { New28Ad } from './New28Ad';
import { GmailAd } from './GmailAd';
import { ParticleWave } from './ParticleWave';
import { AbstractLines } from './AbstractLines';
import { GlassyFlow } from './GlassyFlow';
import { Inbox3DReveal } from './Inbox3DReveal';
import { XeloPromo } from './XeloPromo';
import { PromoEdit } from './PromoEdit';
import { ReplicaAd } from './ReplicaAd';
import { TeaserMax } from './TeaserMax';
import { TeaserMaxLight } from './TeaserMaxLight';
import { ShowcaseMax } from './ShowcaseMax';
import { VerticalFormatter } from './VerticalFormatter';
import { ViralHook } from './ViralHook';
import { DynamicCaptions } from './DynamicCaptions';
import { FinalAd } from './FinalAd';
import { AllVideosAd } from './AllVideosAd';
import { BlackFridayAd } from './BlackFridayAd';
import { EcomAd } from './EcomAd';
import { InboxAd } from './InboxAd';
import { CinematicAd } from './CinematicAd';
import { DynamicAd } from './DynamicAd';
import { InspireAd } from './InspireAd';
import { VisionAd } from './VisionAd';
import { MomentumAd } from './MomentumAd';
import { SequenceAd } from './SequenceAd';
import { FreeSequenceAd } from './FreeSequenceAd';
import { BusyDayAd } from './BusyDayAd';
import { ShowcaseAd } from './ShowcaseAd';
import { FlashShowcaseAd } from './FlashShowcaseAd';
import { EasierEmailAd } from './EasierEmailAd';
import { AutomationAd } from './AutomationAd';
import { GraphicAd } from './GraphicAd';
import { PureGraphicAd } from './PureGraphicAd';
import { MinimalAd } from './MinimalAd';
import { BreakFromNoiseAd } from './BreakFromNoiseAd';
import { CeloFlowAd1 } from './CeloFlowAd1';
import { CeloFlowAd2 } from './CeloFlowAd2';
import { XeloFlowNewAd1 } from './XeloFlowNewAd1';
import { XeloFlowNewAd2 } from './XeloFlowNewAd2';

// Define the brand colors as props to easily modify later
export const BRAND_COLORS = {
  primary: '#FF7F11', // Vibrant Orange
  accent: '#A182EE', // Vibrant Purple
  background: '#FAFAF9', // Ambient White
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="New28Ad"
        component={New28Ad}
        durationInFrames={555}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="GmailAd"
        component={GmailAd}
        durationInFrames={750}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="AllVideosAd"
        component={AllVideosAd}
        durationInFrames={660}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShowcaseMax"
        component={ShowcaseMax}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="TeaserMaxLight"
        component={TeaserMaxLight}
        durationInFrames={630}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="TeaserMax"
        component={TeaserMax}
        durationInFrames={630}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="ParticleBackground"
        component={ParticleWave}
        durationInFrames={300} // 5 Seconds @ 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          color1: BRAND_COLORS.primary,
          color2: BRAND_COLORS.accent,
          bgColor: BRAND_COLORS.background,
        }}
      />
      <Composition
        id="AbstractFlow"
        component={AbstractLines}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          color1: BRAND_COLORS.primary,
          color2: BRAND_COLORS.accent,
          bgColor: BRAND_COLORS.background,
        }}
      />
      <Composition
        id="GlassyBubbleFlow"
        component={GlassyFlow}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          color1: BRAND_COLORS.primary,
          color2: BRAND_COLORS.accent,
          bgColor: BRAND_COLORS.background,
        }}
      />
      <Composition
        id="Inbox3DReveal"
        component={Inbox3DReveal}
        durationInFrames={360}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="XeloPromo"
        component={XeloPromo}
        durationInFrames={1140} // Total frames defined in Sequence components
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="PromoEdit"
        component={PromoEdit}
        durationInFrames={1800} // ~30 seconds @ 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="ReplicaAd"
        component={ReplicaAd}
        durationInFrames={960} // 16 seconds @ 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      {/* ─── VERTICAL (9:16) EXPORTS FOR PHONE ─── */}
      <Composition
        id="XeloPromoVertical"
        component={XeloPromo}
        durationInFrames={1140}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="ShowcaseMaxVertical"
        component={ShowcaseMax}
        durationInFrames={600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="TeaserMaxVertical"
        component={TeaserMax}
        durationInFrames={630}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="TeaserMaxLightVertical"
        component={TeaserMaxLight}
        durationInFrames={630}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Formatter-ShortTest"
        component={VerticalFormatter}
        durationInFrames={1200} // 20 seconds
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: 'formatter_target.mp4'
        }}
      />
      <Composition
        id="Formatter-ReplicaAd"
        component={VerticalFormatter}
        durationInFrames={960} // matches out_replicaad_v2 (16 seconds)
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: 'formatter_target_replica.mp4'
        }}
      />
      <Composition
        id="ViralHook"
        component={ViralHook}
        durationInFrames={600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="FinalAd"
        component={FinalAd}
        durationInFrames={1200}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="BlackFridayAd"
        component={BlackFridayAd}
        durationInFrames={780}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="EcomAd"
        component={EcomAd}
        durationInFrames={1020}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="InboxAd"
        component={InboxAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="CinematicAd"
        component={CinematicAd}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CinematicAdVertical"
        component={CinematicAd}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="DynamicAd"
        component={DynamicAd}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="InspireAd"
        component={InspireAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="InspireAdVertical"
        component={InspireAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="VisionAd"
        component={VisionAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="VisionAdVertical"
        component={VisionAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="MomentumAd"
        component={MomentumAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="MomentumAdVertical"
        component={MomentumAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* ─── SEQUENCE ADS ─── */}
      <Composition
        id="SequenceAd"
        component={SequenceAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="SequenceAdWide"
        component={SequenceAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="FreeSequenceAd"
        component={FreeSequenceAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="FreeSequenceAdWide"
        component={FreeSequenceAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* ─── BUSY DAY AD ─── */}
      <Composition
        id="BusyDayAd"
        component={BusyDayAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="BusyDayAdWide"
        component={BusyDayAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* ─── SHOWCASE ADS ─── */}
      <Composition
        id="ShowcaseAd"
        component={ShowcaseAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="FlashShowcaseAd"
        component={FlashShowcaseAd}
        durationInFrames={600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* ─── EASIER EMAIL AD ─── */}
      <Composition
        id="EasierEmailAd"
        component={EasierEmailAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="EasierEmailAdWide"
        component={EasierEmailAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* ─── AUTOMATION AD ─── */}
      <Composition
        id="AutomationAd"
        component={AutomationAd}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="AutomationAdWide"
        component={AutomationAd}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      {/* ─── GRAPHIC AD ─── */}
      <Composition
        id="GraphicAd"
        component={GraphicAd}
        durationInFrames={600} // 10 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      
      {/* ─── PURE GRAPHIC AD ─── */}
      <Composition
        id="PureGraphicAd"
        component={PureGraphicAd}
        durationInFrames={420} // 7 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      
      {/* ─── MINIMAL AD ─── */}
      <Composition
        id="MinimalAd"
        component={MinimalAd}
        durationInFrames={900} // 15 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      {/* ─── BREAK FROM NOISE AD ─── */}
      <Composition
        id="BreakFromNoiseAd"
        component={BreakFromNoiseAd}
        durationInFrames={600} // 10 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* ─── CELO FLOW ADS ─── */}
      <Composition
        id="CeloFlowAd1"
        component={CeloFlowAd1}
        durationInFrames={720} // 12 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="CeloFlowAd1Wide"
        component={CeloFlowAd1}
        durationInFrames={720}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CeloFlowAd2"
        component={CeloFlowAd2}
        durationInFrames={720} // 12 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="CeloFlowAd2Wide"
        component={CeloFlowAd2}
        durationInFrames={720}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      {/* ─── NEW XELO FLOW ADS ─── */}
      <Composition
        id="XeloFlowNewAd1"
        component={XeloFlowNewAd1}
        durationInFrames={720}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="XeloFlowNewAd2"
        component={XeloFlowNewAd2}
        durationInFrames={720}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
