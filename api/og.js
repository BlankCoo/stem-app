import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 100px',
          background: 'linear-gradient(135deg, #080816 0%, #12122a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        },
        children: [
          // Purple orb
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: -100,
                left: -100,
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
              },
            },
          },
          // Red orb
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: -80,
                right: 100,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,45,85,0.25) 0%, transparent 70%)',
              },
            },
          },
          // Live dot + LIVE badge
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 28,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#ff2d55',
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#ff2d55',
                      letterSpacing: 2,
                    },
                    children: 'LIVE STREAMING PLATFORM',
                  },
                },
              ],
            },
          },
          // STEM title
          {
            type: 'div',
            props: {
              style: {
                fontSize: 110,
                fontWeight: 900,
                letterSpacing: 6,
                background: 'linear-gradient(90deg, #7c3aed, #ff2d55, #ff9500)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 16,
                lineHeight: 1,
              },
              children: 'STEM',
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: {
                fontSize: 32,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 48,
              },
              children: 'Stream and Earn Money',
            },
          },
          // Pills row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: 16,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      padding: '12px 24px',
                      borderRadius: 100,
                      background: 'rgba(0,245,160,0.1)',
                      border: '1.5px solid rgba(0,245,160,0.3)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#00f5a0',
                    },
                    children: '🪙 1,000 coins = $1',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      padding: '12px 24px',
                      borderRadius: 100,
                      background: 'rgba(124,58,237,0.1)',
                      border: '1.5px solid rgba(124,58,237,0.3)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#7c3aed',
                    },
                    children: '💸 Cash out $20+',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      padding: '12px 24px',
                      borderRadius: 100,
                      background: 'rgba(255,45,85,0.1)',
                      border: '1.5px solid rgba(255,45,85,0.3)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#ff2d55',
                    },
                    children: '📺 Viewers earn too',
                  },
                },
              ],
            },
          },
          // URL
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 60,
                right: 100,
                fontSize: 20,
                color: 'rgba(255,255,255,0.3)',
              },
              children: 'stemapp.online',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
