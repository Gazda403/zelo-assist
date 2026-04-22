import { Composition } from 'remotion';
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
import { BlackFridayAd } from './BlackFridayAd';
import { EcomAd } from './EcomAd';

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
    </>
  );
};
