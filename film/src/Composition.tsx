import {Audio, Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Composition, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';

const serif = 'Iowan Old Style, New York, Georgia, serif';
type Format = 'wide' | 'portrait';
const fade = (f: number, n: number) => interpolate(f, [0, 16, n - 16, n], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const enter = (f: number) => interpolate(f, [0, 22], [30, 0], {extrapolateRight: 'clamp'});
const Studio: React.FC<{format: Format; light?: boolean; children: React.ReactNode}> = ({format, light = false, children}) =>
  <AbsoluteFill style={{background: light ? '#e9e4d8' : '#0b211b', color: light ? '#13281f' : '#f5f0e5', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: light ? 'radial-gradient(ellipse at 65% 45%, #fffdf5, #e9e4d8 72%, #c9c4b7)' : 'radial-gradient(ellipse at 66% 43%, #306447, #153b2a 48%, #0b211b 85%)'}} />
    <div style={{position: 'absolute', inset: format === 'wide' ? '5.5%' : '4%', border: `1px solid ${light ? '#50634a35' : '#e8f3de2d'}`}} />
    {children}
    <div style={{position: 'absolute', left: '7%', bottom: '7%', font: `700 ${format === 'wide' ? 17 : 24}px Arial`, letterSpacing: '.24em'}}>LIBROX <span style={{color: '#ed9479'}}>●</span></div>
    <div style={{position: 'absolute', right: '7%', bottom: '7%', font: `600 ${format === 'wide' ? 14 : 20}px Arial`, letterSpacing: '.16em', opacity: .65}}>THE READING EXPERIENCE</div>
  </AbsoluteFill>;

const Copy: React.FC<{format: Format; frame: number; number: string; title: string; sub: string; light?: boolean}> = ({format, frame, number, title, sub, light}) =>
  <div style={{position: 'absolute', zIndex: 3, left: '8%', top: format === 'wide' ? '34%' : '69%', width: format === 'wide' ? '34%' : '84%', opacity: interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${enter(frame)}px)`}}>
    <div style={{font: `700 ${format === 'wide' ? 15 : 22}px Arial`, letterSpacing: '.22em', color: light ? '#925540' : '#ed9479', marginBottom: 26}}>{number} / LIBROX 2.0</div>
    <div style={{font: `400 ${format === 'wide' ? 96 : 100}px/.94 ${serif}`, letterSpacing: '-.07em', whiteSpace: 'pre-line'}}>{title}</div>
    <div style={{font: `400 ${format === 'wide' ? 27 : 34}px/1.36 ${serif}`, maxWidth: 570, marginTop: 27, opacity: .78}}>{sub}</div>
  </div>;

const Duo: React.FC<{format: Format; screen?: string; video?: boolean}> = ({format, screen = 'library.webp', video = false}) =>
  <div style={{position: 'absolute', width: format === 'wide' ? '57%' : '94%', aspectRatio: '3093 / 2247', left: format === 'wide' ? '42%' : '3%', top: format === 'wide' ? '50%' : '24%', transform: format === 'wide' ? 'translateY(-50%)' : undefined}}>
    <div style={{position: 'absolute', left: '3.88%', top: '5.34%', width: '92.24%', height: '89.32%', overflow: 'hidden', borderRadius: '5.8% / 8%', background: '#eee9df'}}>
      {video ? <Video src={staticFile('opening.mp4')} trimBefore={.5} muted objectFit="fill" style={{width: '100%', height: '100%'}} /> : <Img src={staticFile(screen)} style={{width: '100%', height: '100%'}} />}
    </div>
    <Img src={staticFile('duo-bezel.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
  </div>;

const Library: React.FC<{format: Format}> = ({format}) => {const f = useCurrentFrame(); return <Studio format={format} light>
  <div style={{position: 'absolute', width: format === 'wide' ? '57%' : '100%', height: format === 'wide' ? '88%' : '54%', top: format === 'wide' ? '6%' : '11%', right: format === 'wide' ? '2%' : 0, overflow: 'hidden', borderRadius: 24, boxShadow: '0 40px 100px #07201926', opacity: 1, transform: `scale(${interpolate(f, [0, 115], [1.08, 1], {extrapolateRight: 'clamp'})})`}}>
    <Img src={staticFile('library.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: format === 'wide' ? 'center' : '18% center'}} />
  </div>
  <Copy format={format} frame={f+22} number="01" title={'Your library,\nunfolded.'} sub="Real books. A place to begin." light />
</Studio>;};
const Opening: React.FC<{format: Format}> = ({format}) => {const f = useCurrentFrame(); return <Studio format={format}>
  <Copy format={format} frame={f} number="02" title={'Touch the cover.\nEnter the story.'} sub="The native book opening, captured in Librox." />
  <div style={{opacity: fade(f, 180)}}><Duo format={format} video /></div>
  <div style={{position: 'absolute', left: format === 'wide' ? '44%' : '8%', top: format === 'wide' ? '86%' : '61%', font: `600 ${format === 'wide' ? 13 : 18}px Arial`, letterSpacing: '.12em', opacity: .65}}>DEVELOPMENT BUILD · SEQUENCE SHORTENED</div>
</Studio>;};
const Reading: React.FC<{format: Format}> = ({format}) => {const f = useCurrentFrame(); return <Studio format={format} light>
  <Copy format={format} frame={f} number="03" title={'A page to\nstay with.'} sub="The words take the whole room." light />
  <div style={{opacity: fade(f, 126)}}><Duo format={format} screen="reading.webp" /></div>
  <div style={{position: 'absolute', left: format === 'wide' ? '44%' : '8%', top: format === 'wide' ? '86%' : '61%', font: `600 ${format === 'wide' ? 13 : 18}px Arial`, letterSpacing: '.12em', opacity: .65}}>LIBROX 2.0 DESIGN PREVIEW</div>
</Studio>;};
const Listening: React.FC<{format: Format}> = ({format}) => {const f = useCurrentFrame(); return <Studio format={format}>
  <Copy format={format} frame={f} number="04" title={'Keep the\nstory close.'} sub="Move from reading into a cover-colored listening room." />
  <div style={{opacity: fade(f, 126)}}><Duo format={format} screen="listening-duo.webp" /></div>
  <div style={{position: 'absolute', left: format === 'wide' ? '44%' : '8%', top: format === 'wide' ? '86%' : '61%', font: `600 ${format === 'wide' ? 13 : 18}px Arial`, letterSpacing: '.12em', opacity: .65}}>LIBROX 2.0 LISTENING DESIGN PREVIEW</div>
</Studio>;};
const End: React.FC<{format: Format}> = ({format}) => {const f = useCurrentFrame(); return <Studio format={format}>
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: interpolate(f, [0, 24], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${enter(f)}px)`}}>
    <div style={{font: `400 ${format === 'wide' ? 150 : 110}px/.9 ${serif}`, letterSpacing: '-.07em'}}>Stories feel<br/><em style={{color: '#ed9479'}}>closer here.</em></div>
    <div style={{marginTop: 60, font: `600 ${format === 'wide' ? 19 : 23}px Arial`, letterSpacing: '.21em'}}>READ · LISTEN · RETURN</div>
  </div>
</Studio>;};
const Film: React.FC<{format: Format}> = ({format}) => <AbsoluteFill style={{background: '#0b211b'}}>
  <Sequence durationInFrames={120} premountFor={30}><Library format={format} /></Sequence>
  <Sequence from={108} durationInFrames={180} premountFor={30}><Opening format={format} /></Sequence>
  <Sequence from={276} durationInFrames={126} premountFor={30}><Reading format={format} /></Sequence>
  <Sequence from={390} durationInFrames={126} premountFor={30}><Listening format={format} /></Sequence>
  <Sequence from={504} durationInFrames={96} premountFor={30}><End format={format} /></Sequence>
  <Audio src={staticFile('score.mp3')} volume={0.48} />
</AbsoluteFill>;
export const LibroxCompositions: React.FC = () => <>
  <Composition id="LibroxFilm" component={Film} defaultProps={{format: 'wide' as Format}} durationInFrames={600} fps={30} width={1920} height={1080} />
  <Composition id="LibroxFilmPortrait" component={Film} defaultProps={{format: 'portrait' as Format}} durationInFrames={600} fps={30} width={1080} height={1920} />
</>;
