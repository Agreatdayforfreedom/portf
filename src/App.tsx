import {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Ball, GenInstances } from "./Ball";
import { detectCollisions } from "./Collider";

import React, { useLayoutEffect } from "react";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      // ref.current.widg
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

function App() {
  const [TotalBalls, setTotalBalls] = useState<number>(10);
  // const [balls, setBalls] = useState<Ball[]>([]);
  const balls: Ball[] = [];
  const ref = useRef<HTMLCanvasElement>(null);

  const changeTotalBalls = (e: ChangeEvent<HTMLInputElement>) => {
    if (parseInt(e.target.value) > 100) return;
    if (!Number.isNaN(parseInt(e.target.value)))
      setTotalBalls(parseInt(e.target.value));
  };
  const size = useWindowSize();
  useEffect(() => {
    if (ref.current) {
      ref.current.width = size[0];
      ref.current.height = size[1];
    }
  }, [size]);
  useEffect(() => {
    if (ref.current) {
      const total = GenInstances(TotalBalls);
      balls.push(...total);
    }
  }, [TotalBalls]);

  useEffect(() => {
    let frameId: number;
    if (ref?.current) {
      const ctx = ref?.current?.getContext("2d");
      const frame = (time: any) => {
        if (ctx && ref.current && balls.length > 0) {
          ctx.clearRect(0, 0, ref.current.width, ref.current.height);
          for (const ball of balls) {
            ctx.save();

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ball.color;
            ctx.shadowColor = ball.color;
            // ctx.lineDashOffset = 1;
            if (ball.dashed) {
              ctx.setLineDash([1, 3]);
            }

            // ctx.shadowColor = ball.color;
            ctx.shadowBlur = ball.brightness;
            ctx.lineWidth = ball.brightness / 10;
            if (
              ball.dx < 1.5 &&
              ball.dx > -1.5 &&
              ball.dy < 1.5 &&
              ball.dy > -1.5
            ) {
              ball.dx *= 5;
              ball.dy *= 5;
              ball.accelerate = true;
            }
            // } else ball.accelerate = false;
            ctx.stroke();
            ctx.closePath();

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // ctx.beginPath();
            // ctx.moveTo(ball.x, ball.y);
            // ctx.lineTo(ball.x + ball.dx * 10, ball.y + ball.dy * 10);
            // ctx.strokeStyle = "#ff00ff";
            // ctx.stroke();

            ctx.restore();

            doShine(ball);
            burnFigure(ctx, ball);
            storeLastPosition(ball);
            detectCollisions(
              ref.current.width,
              ref.current.height,
              ball,
              balls
            );
            ball.x += ball.dx;
            ball.y += ball.dy;
          }
          frameId = requestAnimationFrame(frame);
        }
      };
      frameId = requestAnimationFrame(frame);
    }

    return () => cancelAnimationFrame(frameId);
  }, [balls, TotalBalls]);

  var motionTrailLength = 10;

  function burnFigure(ctx: CanvasRenderingContext2D, ball: Ball) {
    if (ball.accelerate) {
      if (ball.dx < 4 && ball.dx > -4 && ball.dy < 4 && ball.dx > -4) {
        ball.accelerate = false;
        return;
      }
      for (var i = 0; i < ball.positions.length; i++) {
        //do draw
        var ratio = (i + 1) / ball.positions.length;
        ctx.beginPath();
        ctx.arc(
          ball.positions[i].x,
          ball.positions[i].y,
          (ball.radius * (i + 1)) / 7.5,
          0,
          2 * Math.PI,
          true
        );
        ctx.fillStyle = `${ball.color}${Math.floor(ratio)}9`;
        ctx.fill();
      }
    }
  }
  function storeLastPosition(ball: Ball) {
    // push an item
    ball.positions.push({
      x: ball.x,
      y: ball.y,
    }); //get rid of first item
    if (ball.positions.length > motionTrailLength) {
      ball.positions.shift();
    }
  }

  function doShine(ball: Ball) {
    if (ball.shine) {
      const fn = -1 * ball.util_count ** 2 + 10 * ball.util_count + 5;

      ball.brightness = fn;
      ball.util_count += 0.1;
    }
  }
  return (
    <>
      <header className="header"></header>
      <main className="main">
        <aside className="aside"></aside>
        <section>
          <div className="inputDiv">
            <input
              type="number"
              className="input"
              defaultValue={TotalBalls}
              onChange={changeTotalBalls}
              max={100}
              min={1}
            />
            <span>max: 100</span>
            <span>max: 1</span>
            <span>current: {TotalBalls}</span>
          </div>
          <canvas ref={ref} id="objects"></canvas>
        </section>
      </main>
    </>
  );
}

export default App;
