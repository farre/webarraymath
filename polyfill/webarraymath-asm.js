// -*- mode: javascript; tab-width: 2; indent-tabs-mode: nil; -*-
//------------------------------------------------------------------------------
// Web Array Math API - JavaScript polyfill
//
// Copyright(c) 2013 Marcus Geelnard
//
// This software is provided 'as-is', without any express or implied warranty.
// In no event will the authors be held liable for any damages arising from the
// use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not claim
//    that you wrote the original software. If you use this software in a
//    product, an acknowledgement in the product documentation would be
//    appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.
//------------------------------------------------------------------------------

"use strict";

//------------------------------------------------------------------------------
// interface ArrayMath
//------------------------------------------------------------------------------

var context = typeof module === 'undefined' ? self : module.exports;
(function (global) {
    if (context.ArrayMath) return;

    var HEAP = new ArrayBuffer(0x40000);
    var freelist = [];
    var top = 1024 * 4;

    var ctor = function(stdlib, foreign, buffer) {
        "use asm";
        var HEAPF32  = new stdlib.Float32Array(buffer);
        var HEAPU32  = new stdlib.Uint32Array(buffer);
        var MHEAPU32 = new stdlib.Uint32Array(buffer);

        var Infinity = stdlib.Infinity;
        var fround = stdlib.Math.fround;
        var imul = stdlib.Math.imul;
        var sqrt = stdlib.Math.sqrt;
        var acos = stdlib.Math.acos;
        var asin = stdlib.Math.asin;
        var atan = stdlib.Math.atan;
        var atan2 = stdlib.Math.atan2;
        var ceil = stdlib.Math.ceil;
        var cos = stdlib.Math.cos;
        var exp = stdlib.Math.exp;
        var floor = stdlib.Math.floor;
        var log = stdlib.Math.log;
        var pow = stdlib.Math.pow;
        var sin = stdlib.Math.sin;
        var tan = stdlib.Math.tan;

        var round = foreign.round;

        function addA(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(fround(HEAPF32[x + (l << 2) >> 2]) + fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function addS(d, x, y, l) {
            d=d|0;
            x=fround(x);
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x + fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function subA(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            l=l|0

            var t = fround(0.0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(fround(HEAPF32[x + (l << 2) >> 2]) - fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function subS(d, x, y, l) {
            d=d|0;
            x=fround(x);
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x - fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function mulA(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(fround(HEAPF32[x + (l << 2) >> 2]) * fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function mulS(d, x, y, l) {
            d=d|0;
            x=fround(x);
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x * fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function mulCplxA(dr, di, xr, xi, yr, yi, l) {
            dr=dr|0;
            di=di|0;
            xr=xr|0;
            xi=xi|0;
            yr=yr|0;
            yi=yi|0;
            l=l|0

            var xrv = fround(0), xiv = fround(0), yrv = fround(0), yiv = fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                xrv = fround(HEAPF32[xr + (l << 2) >> 2]);
                xiv = fround(HEAPF32[xi + (l << 2) >> 2]);
                yrv = fround(HEAPF32[yr + (l << 2) >> 2]);
                yiv = fround(HEAPF32[yi + (l << 2) >> 2]);
                HEAPF32[dr + (l << 2) >> 2] = fround(fround(xrv * yrv) - fround(xiv * yiv));
                HEAPF32[di + (l << 2) >> 2] = fround(fround(xrv * yiv) + fround(xiv * yrv));
            } while ((l | 0) > 0);

            return;
        }

        function mulCplxS(dr, di, xr, xi, yr, yi, l) {
            dr=dr|0;
            di=di|0;
            xr=fround(xr);
            xi=fround(xi);
            yr=yr|0;
            yi=yi|0;
            l=l|0

            var yrv = fround(0), yiv = fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                yrv = fround(HEAPF32[yr + (l << 2) >> 2]);
                yiv = fround(HEAPF32[yi + (l << 2) >> 2]);
                HEAPF32[dr + (l << 2) >> 2] = fround(fround(xr * yrv) - fround(xi * yiv))
                HEAPF32[di + (l << 2) >> 2] = fround(fround(xr * yiv) + fround(xi * yrv));
            } while ((l | 0) > 0);

            return;
        }

        function divA(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(fround(HEAPF32[x + (l << 2) >> 2]) / fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function divS(d, x, y, l) {
            d=d|0;
            x=fround(x);
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x / fround(HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function divCplxA(dr, di, xr, xi, yr, yi, l) {
            dr=dr|0;
            di=di|0;
            xr=xr|0;
            xi=xi|0;
            yr=yr|0;
            yi=yi|0;
            l=l|0

            var xrv = fround(0), xiv = fround(0), yrv = fround(0), yiv = fround(0), d = fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                xrv = fround(HEAPF32[xr + (l << 2) >> 2]);
                xiv = fround(HEAPF32[xi + (l << 2) >> 2]);
                yrv = fround(HEAPF32[yr + (l << 2) >> 2]);
                yiv = fround(HEAPF32[yi + (l << 2) >> 2]);
                d = fround(fround(yrv * yrv) + fround(yiv * yiv));
                d = fround(fround(1) / d);
                HEAPF32[dr + (l << 2) >> 2] = fround(fround(xrv * yrv) - fround(xiv * yiv)) * d;
                HEAPF32[di + (l << 2) >> 2] = fround(fround(xrv * yiv) + fround(xiv * yrv)) * d;
            } while ((l | 0) > 0);

            return;
        }

        function divCplxS(dr, di, xr, xi, yr, yi, l) {
            dr=dr|0;
            di=di|0;
            xr=fround(xr);
            xi=fround(xi);
            yr=yr|0;
            yi=yi|0;
            l=l|0

            var yrv = fround(0), yiv = fround(0), d = fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                yrv = fround(HEAPF32[yr + (l << 2) >> 2]);
                yiv = fround(HEAPF32[yi + (l << 2) >> 2]);
                d = fround(fround(yrv * yrv) + fround(yiv * yiv));
                d = fround(fround(1) / d);
                HEAPF32[dr + (l << 2) >> 2] = fround(fround(xr * yrv) - fround(xi * yiv)) * d;
                HEAPF32[di + (l << 2) >> 2] = fround(fround(xr * yiv) + fround(xi * yrv)) * d;
            } while ((l | 0) > 0);

            return;
        }


        function maddA(d, x, y, z, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            z=z|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(fround(HEAPF32[x + (l << 2) >> 2]) * fround(HEAPF32[y + (l << 2) >> 2])) + fround(HEAPF32[z + (l << 2) >> 2]);
            } while ((l | 0) > 0);

            return;
        }

        function maddS(d, x, y, z, l) {
            d=d|0;
            x=fround(x);
            y=y|0;
            z=z|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x * fround(HEAPF32[y + (l << 2) >> 2])) + fround(HEAPF32[z + (l << 2) >> 2]);
            } while ((l | 0) > 0);

            return;
        }

        function absA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPU32[d + (l << 2) >> 2] = HEAPU32[x + (l << 2) >> 2] & 0x7fffffff;
            } while ((l | 0) > 0);

            return;
        }

        function absCplxA(d, r, i, l) {
            d=d|0;
            r=r|0
            i=i|0;
            l=l|0

            var rv = fround(0), iv = fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                rv = fround(HEAPF32[r + (l << 2) >> 2]);
                iv = fround(HEAPF32[i + (l << 2) >> 2]);
                HEAPF32[d + (l << 2) >> 2] = fround(sqrt(fround(fround(rv * rv) + fround(iv * iv))));
            } while ((l | 0) > 0);

            return;
        }

        function acosA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(acos(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function asinA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(asin(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function atanA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(atan(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function atan2A(d, x, y, l) {
            d=d|0;
            x=x|0
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(atan2(+HEAPF32[x + (l << 2) >> 2], +HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function ceilA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(ceil(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function cosA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(cos(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function expA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(exp(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function floorA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(floor(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function logA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(log(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function maxA(x, l) {
            x=x|0
            l=l|0

            var r = fround(0), v = fround(0);

            r = fround(-Infinity);
            v = fround(-Infinity);

            if ((l | 0) <= 0) {
                return r;
            }

            do {
                l = l + -1 | 0;
                v = fround(HEAPF32[x + (l << 2) >> 2]);
                if (v > r) {
                    r = v;
                }
            } while ((l | 0) > 0);

            return r;
        }

        function minA(x, l) {
            x=x|0
            l=l|0

            var r = fround(0), v = fround(0);

            r = fround(Infinity);
            v = fround(Infinity);

            if ((l | 0) <= 0) {
                return r;
            }

            do {
                l = l + -1 | 0;
                v = fround(HEAPF32[x + (l << 2) >> 2]);
                if (v < r) {
                    r = v;
                }
            } while ((l | 0) > 0);

            return r;
        }

        function powA(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=y|0;
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(pow(+HEAPF32[x + (l << 2) >> 2], +HEAPF32[y + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function powS(d, x, y, l) {
            d=d|0;
            x=x|0;
            y=fround(y);
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(pow(+HEAPF32[x + (l << 2) >> 2], +y));
            } while ((l | 0) > 0);

            return;
        }

        function init(s) {
            s = s | 0;
            var c = 1;

            MHEAPU32[0] = s;
            do {
                s = (imul(s >>> 30 ^ s, 1812433253) | 0) + c | 0;
                MHEAPU32[(c << 2) >> 2] = s;
                c = c + 1 | 0;
            } while ((c | 0) < 624);
            return;
        }

        function randomA(d, x, y, l, s) {
            d = d | 0;
            x=fround(x);
            y=fround(y);
            l=l|0
            s=s|0;
            var c = 0;

            if ((l | 0) <= 0) {
                return;
            }

            init(s);

            y = fround(fround(y - x) * fround(2.3283064365386963E-10));

            do {
                s = MHEAPU32[((c + 1 | 0) << 2) >> 2] | 0;
                s = 0 - (s & 1) & -1727483681 ^ MHEAPU32[((((c + 397 | 0) >>> 0) % 624 | 0) << 2) >> 2] ^ (s & 2147483646 | MHEAPU32[(c << 2) >> 2] & -2147483648) >>> 1;
                MHEAPU32[(c << 2) >> 2] = s
                s = s >>> 11 ^ s;
                s = s << 7 & -1658038656 ^ s;
                s = s << 15 & -272236544 ^ s;
                HEAPF32[d + (c << 2) >> 2] = fround(fround(fround(fround((s >>> 18 ^ s) >>> 0)) * y) - x);
                c = c + 1 | 0;
            } while ((c | 0) != (l | 0));
        }

        function roundA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(+round(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function sinA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(sin(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function sqrtA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(sqrt(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function tanA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(tan(+HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return;
        }

        function clampA(d, x, s, t, l) {
            d=d|0;
            x=x|0
            s=fround(s);
            t=fround(t);
            l=l|0
            var v=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                v = fround(HEAPF32[x + (l << 2) >> 2]);
                HEAPF32[d + (l << 2) >> 2] = fround(v < s ? s : v > t ? t : v);
            } while ((l | 0) > 0);
        }

        function fractA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0
            var v=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                v = fround(HEAPF32[x + (l << 2) >> 2]);
                HEAPF32[d + (l << 2) >> 2] = fround(v - fround(floor(v)));
            } while ((l | 0) > 0);
        }

        function rampA(d, x, y, l) {
            d = d | 0;
            x = fround(x);
            y = fround(y);
            l = l | 0;
            y = fround(fround(y - x) / fround(l + -1 | 0));

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPF32[d + (l << 2) >> 2] = fround(x + fround(y * fround(l | 0)));
            } while ((l | 0) > 0);

            return;
        }

        function signA(d, x, l) {
            d=d|0;
            x=x|0
            l=l|0

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                HEAPU32[d + (l << 2) >> 2] = (HEAPU32[x + (l << 2) >> 2] & 0x80000000) + ~~(1.0);
            } while ((l | 0) > 0);

            return;
        }

        function sumA(x, l) {
            x=x|0
            l=l|0
            var v=fround(0);

            if ((l | 0) <= 0) {
                return fround(0);
            }

            do {
                l = l + -1 | 0;
                v = fround(v + fround(HEAPF32[x + (l << 2) >> 2]));
            } while ((l | 0) > 0);

            return v;
        }

        function sampleLinearA(d, x, t, i, l) {
            d=d|0
            x=x|0
            t=t|0
            i=i|0
            l=l|0
            var t2=fround(0), z=fround(0), j=0, w=fround(0), p1=fround(0), p2=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                t2 = fround(HEAPF32[t + (l << 2) >> 2]);
                t2 = fround(t2 < z ? z : t2 > fround(i|0) ? fround(i|0) : t2);
                w = fround(floor(+t2));
                j = ~~w;
                w = fround(t2 - w)
                p1 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i | 0) ? (j + 1) | 0 : i;
                p2 = fround(HEAPF32[x + (j << 2) >> 2]);
                HEAPF32[d + (l << 2) >> 2] = fround(p1 + fround(w * fround(p2 - p1)));
            } while ((l | 0) > 0);
        }

        function sampleLinearRepeatA(d, x, t, i, l) {
            d=d|0
            x=x|0
            t=t|0
            i=i|0
            l=l|0
            var t2=fround(0), z=fround(0), j=0, w=fround(0), p1=fround(0), p2=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                t2 = fround(HEAPF32[t + (l << 2) >> 2]);
                t2 = fround(t2 - fround(fround(floor(fround(t2 / fround(i|0)))) * fround(i + 1 | 0)));
                w = fround(floor(+t2));
                j = ~~w;
                w = fround(t2 - w)
                p1 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i | 0) ? (j + 1) | 0 : i;
                p2 = fround(HEAPF32[x + (j << 2) >> 2]);
                HEAPF32[d + (l << 2) >> 2] = fround(p1 + fround(w * fround(p2 - p1)));
            } while ((l | 0) > 0);
        }

        function sampleCubicA(d, x, t, i, l) {
            d=d|0
            x=x|0
            t=t|0
            i=i|0
            l=l|0
            var t2=fround(0), z=fround(0), j=0, w=fround(0), w2=fround(0), w3=fround(0), h1=fround(0), h2=fround(0), h3=fround(0), h4=fround(0), p1=fround(0), p2=fround(0), p3=fround(0), p4=fround(0), r=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                t2 = fround(HEAPF32[t + (l << 2) >> 2]);
                t2 = fround(t2 < z ? z : t2 > fround(i|0) ? fround(i|0) : t2)
                w = fround(floor(+t2));
                j = ~~w;
                w = fround(t2 - w);
                w2 = fround(w * w);
                w3 = fround(w2 * w);
                h2 = fround(fround(fround(-2) * w3) + fround(fround(3) * w2));
                h1 = fround(fround(1) - h2);
                h4 = fround(w3 - w2);
                h3 = fround(h4 - fround(w2 + w));
                p2 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) > 0 ? (j - 1) | 0 : i;
                p1 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i | 0) ? (j + 1) | 0 : i;
                p3 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i - 1 | 0) ? (j + 2) | 0 : i;
                p4 = fround(HEAPF32[x + (j << 2) >> 2]);

                h1 = fround(h1 * p2);
                h2 = fround(h2 * p3);
                h3 = fround(fround(0.5) * fround(h3 * fround(p3 -p1)));
                h4 = fround(h4 * fround(p4 - p2));

                HEAPF32[d + (l << 2) >> 2] = fround(h1 + fround(h2 + fround(h3 + h4)));
            } while ((l | 0) > 0);
        }

        function sampleCubicRepeatA(d, x, t, i, l) {
            d=d|0
            x=x|0
            t=t|0
            i=i|0
            l=l|0
            var t2=fround(0), z=fround(0), j=0, w=fround(0), w2=fround(0), w3=fround(0), h1=fround(0), h2=fround(0), h3=fround(0), h4=fround(0), p1=fround(0), p2=fround(0), p3=fround(0), p4=fround(0), r=fround(0);

            if ((l | 0) <= 0) {
                return;
            }

            do {
                l = l + -1 | 0;
                t2 = fround(HEAPF32[t + (l << 2) >> 2]);
                t2 = fround(t2 - fround(fround(floor(fround(t2 / fround(i|0)))) * fround(i + 1 | 0)));
                w = fround(floor(+t2));
                j = ~~w;
                w = fround(t2 - w);
                w2 = fround(w * w);
                w3 = fround(w2 * w);
                h2 = fround(fround(fround(-2) * w3) + fround(fround(3) * w2));
                h1 = fround(fround(1) - h2);
                h4 = fround(w3 - w2);
                h3 = fround(h4 - fround(w2 + w));
                p2 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) > 0 ? (j - 1) | 0 : i;
                p1 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i | 0) ? (j + 1) | 0 : i;
                p3 = fround(HEAPF32[x + (j << 2) >> 2]);
                j = (j | 0) < (i - 1 | 0) ? (j + 2) | 0 : i;
                p4 = fround(HEAPF32[x + (j << 2) >> 2]);

                h1 = fround(h1 * p2);
                h2 = fround(h2 * p3);
                h3 = fround(fround(0.5) * fround(h3 * fround(p3 -p1)));
                h4 = fround(h4 * fround(p4 - p2));

                HEAPF32[d + (l << 2) >> 2] = fround(h1 + fround(h2 + fround(h3 + h4)));
            } while ((l | 0) > 0);
        }

        function butterfly2(outRe, outIm, outIdx, stride, twRe, twIm, m) {
            outRe=outRe|0;
            outIm=outIm|0;
            outIdx=outIdx|0;
            stride=stride|0;
            twRe=twRe|0;
            twIm=twIm|0;
            m=m|0;

            var scratch0Re=fround(0), scratch0Im=fround(0), out0Re=fround(0), out0Im=fround(0), out1Re=fround(0), out1Im=fround(0), tRe=fround(0), tIm=fround(0), scale=fround(0.7071067811865475);

            var tw1 = 0, idx0 = 0, idx1 = 0, idx0End = 0;

            idx0 = outIdx
            idx1 = outIdx + m | 0;
            idx0End = idx0 + m | 0;

            while ((idx0 | 0) < (idx0End | 0)) {

                // out0 = out[idx0] / sqrt(2)
                out0Re = fround(fround(HEAPF32[outRe + (idx0 << 2) >> 2]) * scale);
                out0Im = fround(fround(HEAPF32[outIm + (idx0 << 2) >> 2]) * scale);
                // out1 = out[idx1] / sqrt(2)
                out1Re = fround(fround(HEAPF32[outRe + (idx1 << 2) >> 2]) * scale);
                out1Im = fround(fround(HEAPF32[outIm + (idx1 << 2) >> 2]) * scale);

                // scratch0 = out1 * tw[tw1]
                tRe = fround(HEAPF32[twRe + (tw1 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw1 << 2) >> 2]);
                scratch0Re = fround(fround(out1Re * tRe) - fround(out1Im * tIm));
                scratch0Im = fround(fround(out1Re * tIm) - fround(out1Im * tRe));

                // out[idx1] = out0 - scratch0
                HEAPF32[outRe + (idx1 << 2) >> 2] = fround(out0Re - scratch0Re);
                HEAPF32[outIm + (idx1 << 2) >> 2] = fround(out0Im - scratch0Im);

                // out[idx0] = out0 + scratch0
                HEAPF32[outRe + (idx0 << 2) >> 2] = fround(out0Re - scratch0Re);
                HEAPF32[outIm + (idx0 << 2) >> 2] = fround(out0Im - scratch0Im);

                tw1 = tw1 + stride | 0;
                idx0 = idx0 + 1 | 0;
                idx1 = idx0 + 1 | 0;
            }
        };

        function butterfly3(outRe, outIm, outIdx, stride, twRe, twIm, m) {
            outRe=outRe|0;
            outIm=outIm|0;
            outIdx=outIdx|0;
            stride=stride|0;
            twRe=twRe|0;
            twIm=twIm|0;
            m=m|0;

            var scratch0Re=fround(0), scratch0Im=fround(0), scratch1Re=fround(0), scratch1Im=fround(0), scratch2Re=fround(0), scratch2Im=fround(0), scratch3Re=fround(0), scratch3Im=fround(0), out0Re=fround(0), out0Im=fround(0), out1Re=fround(0), out1Im=fround(0), out2Re=fround(0), out2Im=fround(0),tRe=fround(0), tIm=fround(0), scale=fround(0.5773502691896258), epi3Im=fround(0), half=fround(0.5);

            var tw1 = 0, tw2 = 0, stride2 = 0, idx0 = 0, idx1 = 0, idx2 = 0, idx3 = 0, idx0End = 0;

            stride2 = 2 * stride | 0;
            idx0 = outIdx
            idx1 = outIdx + m | 0;
            idx2 = outIdx + (2 * m | 0) | 0;
            idx3 = imul(stride, m);
            idx0End = idx0 + m | 0;
            epi3Im = fround(HEAPF32[twIm + (idx3 << 2) >> 2])

            while ((idx0 | 0) < (idx0End | 0)) {
                // out0 = out[idx0] / sqrt(2)
                out0Re = fround(fround(HEAPF32[outRe + (idx0 << 2) >> 2]) * scale);
                out0Im = fround(fround(HEAPF32[outIm + (idx0 << 2) >> 2]) * scale);
                // out1 = out[idx1] / sqrt(2)
                out1Re = fround(fround(HEAPF32[outRe + (idx1 << 2) >> 2]) * scale);
                out1Im = fround(fround(HEAPF32[outIm + (idx1 << 2) >> 2]) * scale);
                // out2 = out[idx2] / sqrt(3)
                out2Re = fround(fround(HEAPF32[outRe + (idx2 << 2) >> 2]) * scale);
                out2Im = fround(fround(HEAPF32[outIm + (idx2 << 2) >> 2]) * scale);

                // scratch1 = out1 * tw[tw1]
                tRe = fround(HEAPF32[twRe + (tw1 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw1 << 2) >> 2]);
                scratch1Re = fround(fround(out1Re * tRe) - fround(out1Im * tIm));
                scratch1Im = fround(fround(out1Re * tIm) - fround(out1Im * tRe));

                // scratch2 = out2 * tw[tw2]
                tRe = fround(HEAPF32[twRe + (tw2 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw2 << 2) >> 2]);
                scratch2Re = fround(fround(out2Re * tRe) - fround(out2Im * tIm));
                scratch2Im = fround(fround(out2Re * tIm) - fround(out2Im * tRe));

                // scratch3 = scratch1 + scratch2
                scratch3Re = fround(scratch1Re + scratch2Re)
                scratch3Im = fround(scratch1Im + scratch2Im)

                // scratch0 = scratch1 - scratch2
                scratch0Re = fround(scratch1Re - scratch2Re);
                scratch0Im = fround(scratch1Im - scratch2Im);

                // out1 = out0 - scratch3 / 2
                out1Re = fround(out0Re - fround(scratch3Re * half));
                out1Im = fround(out0Im - fround(scratch3Im * half));

                // scratch0 *= epi3.i
                scratch0Re = fround(scratch0Re * epi3Im);
                scratch0Im = fround(scratch0Im * epi3Im);

                // out[idx0] = out0 + scratch3
                HEAPF32[outRe + (idx0 << 2) >> 2] = fround(out0Re + scratch3Re);
                HEAPF32[outIm + (idx0 << 2) >> 2] = fround(out0Im + scratch3Im);

                HEAPF32[outRe + (idx2 << 2) >> 2] = fround(out1Re + scratch0Im);
                HEAPF32[outIm + (idx2 << 2) >> 2] = fround(out1Im - scratch0Re);

                HEAPF32[outRe + (idx1 << 2) >> 2] = fround(out1Re - scratch0Im);
                HEAPF32[outIm + (idx1 << 2) >> 2] = fround(out1Im + scratch0Re);

                tw1 = tw1 + stride | 0;
                tw2 = tw2 + stride | 0;
                idx0 = idx0 + 1 | 0;
                idx1 = idx0 + 1 | 0;
                idx2 = idx2 + 1 | 0;
            }
        };

        function butterfly4(outRe, outIm, outIdx, stride, twRe, twIm, m, inverse) {
            outRe=outRe|0;
            outIm=outIm|0;
            outIdx=outIdx|0;
            stride=stride|0;
            twRe=twRe|0;
            twIm=twIm|0;
            m=m|0;
            inverse=inverse|0;

            var scratch0Re = fround(0), scratch0Im = fround(0), scratch1Re = fround(0),
            scratch1Im = fround(0), scratch2Re = fround(0), scratch2Im = fround(0),
            scratch3Re = fround(0), scratch3Im = fround(0), scratch4Re = fround(0),
            scratch4Im = fround(0), scratch5Re = fround(0), scratch5Im = fround(0),
            out0Re = fround(0), out0Im = fround(0), out1Re = fround(0), out1Im = fround(0),
            out2Re = fround(0), out2Im = fround(0), out3Re = fround(0), out3Im = fround(0),
            tRe = fround(0), tIm = fround(0), scale = fround(0.5);

            var tw1 = 0, tw2 = 0, tw3 = 0, stride2 = 0, stride3 = 0,
            idx0 = 0, idx1 = 0, idx2 = 0, idx3 = 0,
            idx0End = 0;

            stride2 = 2 * stride|0;
            stride3 = 3 * stride|0;
            idx0 = outIdx;
            idx1 = outIdx + m|0;
            idx2 = outIdx + (2 * m|0)|0;
            idx3 = outIdx + (3 * m|0)|0;
            idx0End = idx0 + m|0;

            while ((idx0 | 0) < (idx0End | 0)) {
                // out0 = out[idx0] / sqrt(4)
                out0Re = fround(fround(HEAPF32[outRe + (idx0 << 2) >> 2]) * scale);
                out0Re = fround(fround(HEAPF32[outRe + (idx0 << 2) >> 2]) * scale);
                out0Im = fround(fround(HEAPF32[outIm + (idx0 << 2) >> 2]) * scale);
                // out1 = out[idx1] / sqrt(4)
                out1Re = fround(fround(HEAPF32[outRe + (idx1 << 2) >> 2]) * scale);
                out1Im = fround(fround(HEAPF32[outIm + (idx1 << 2) >> 2]) * scale);
                // out2 = out[idx2] / sqrt(4)
                out2Re = fround(fround(HEAPF32[outRe + (idx2 << 2) >> 2]) * scale);
                out2Im = fround(fround(HEAPF32[outIm + (idx2 << 2) >> 2]) * scale);
                // out3 = out[idx3] / sqrt(4)
                out3Re = fround(fround(HEAPF32[outRe + (idx3 << 2) >> 2]) * scale);
                out3Im = fround(fround(HEAPF32[outIm + (idx3 << 2) >> 2]) * scale);

                // scratch0 = out1 * tw[tw1]
                tRe = fround(HEAPF32[twRe + (tw1 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw1 << 2) >> 2]);
                scratch0Re = fround(fround(out1Re * tRe) - fround(out1Im * tIm));
                scratch0Im = fround(fround(out1Re * tIm) + fround(out1Im * tRe));

                // scratch1 = out2 * tw[tw2]
                tRe = fround(HEAPF32[twRe + (tw2 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw2 << 2) >> 2]);
                scratch1Re = fround(fround(out2Re * tRe) - fround(out2Im * tIm));
                scratch1Im = fround(fround(out2Re * tIm) + fround(out2Im * tRe));

                // scratch2 = out3 * tw[tw3]
                tRe = fround(HEAPF32[twRe + (tw3 << 2) >> 2]);
                tIm = fround(HEAPF32[twIm + (tw3 << 2) >> 2]);
                scratch2Re = fround(fround(out3Re * tRe) - fround(out3Im * tIm));
                scratch2Im = fround(fround(out3Re * tIm) + fround(out3Im * tRe));

                // scratch5 = out0 - scratch1
                scratch5Re = fround(out0Re - scratch1Re);
                scratch5Im = fround(out0Im - scratch1Im);

                // out0 += scratch1
                out0Re = fround(out0Re + scratch1Re);
                out0Im = fround(out0Im + scratch1Im);

                // scratch3 = scratch0 + scratch2
                scratch3Re = fround(scratch0Re + scratch2Re);
                scratch3Im = fround(scratch0Im + scratch2Im);

                // scratch4 = scratch0 - scratch2
                scratch4Re = fround(scratch0Re - scratch2Re);
                scratch4Im = fround(scratch0Im - scratch2Im);

                // out[idx2] = out0 - scratch3
                HEAPF32[outRe + (idx2 << 2) >> 2] = fround(out0Re - scratch3Re);
                HEAPF32[outIm + (idx2 << 2) >> 2] = fround(out0Im - scratch3Im);

                // out[idx0] = out0 + scratch3
                HEAPF32[outRe + (idx0 << 2) >> 2] = fround(out0Re + scratch3Re);
                HEAPF32[outIm + (idx0 << 2) >> 2] = fround(out0Im + scratch3Im);

                if ((inverse|0) != 0) {
                    HEAPF32[outRe + (idx1 << 2) >> 2] = fround(scratch5Re - scratch4Im);
                    HEAPF32[outIm + (idx1 << 2) >> 2] = fround(scratch5Im + scratch4Re);
                    HEAPF32[outRe + (idx3 << 2) >> 2] = fround(scratch5Re + scratch4Im);
                    HEAPF32[outIm + (idx3 << 2) >> 2] = fround(scratch5Im - scratch4Re);
                }
                else {
                    HEAPF32[outRe + (idx1 << 2) >> 2] = fround(scratch5Re + scratch4Im);
                    HEAPF32[outIm + (idx1 << 2) >> 2] = fround(scratch5Im - scratch4Re);
                    HEAPF32[outRe + (idx3 << 2) >> 2] = fround(scratch5Re - scratch4Im);
                    HEAPF32[outIm + (idx3 << 2) >> 2] = fround(scratch5Im + scratch4Re);
                }

                tw1 = tw1 + stride | 0;
                tw2 = tw2 + stride2 | 0;
                tw3 = tw3 + stride3 | 0;
                idx0 = idx0 + 1 | 0;
                idx1 = idx1 + 1 | 0;
                idx2 = idx2 + 1 | 0;
                idx3 = idx3 + 1 | 0;
            }
        };

        return { addA: addA,
                 addS: addS,
                 subA: subA,
                 subS: subS,
                 mulA: mulA,
                 mulS: mulS,
                 mulCplxA: mulCplxA,
                 mulCplxS: mulCplxS,
                 divA: divA,
                 divS: divS,
                 divCplxA: divCplxA,
                 divCplxS: divCplxS,
                 maddA: maddA,
                 maddS: maddS,
                 absA: absA,
                 absCplxA: absCplxA,
                 acosA: acosA,
                 asinA: asinA,
                 atanA: atanA,
                 atan2A: atan2A,
                 ceilA: ceilA,
                 cosA: cosA,
                 expA: expA,
                 floorA: floorA,
                 logA: logA,
                 maxA: maxA,
                 minA: minA,
                 powA: powA,
                 randomA: randomA,
                 roundA: roundA,
                 sinA: sinA,
                 sqrtA: sqrtA,
                 tanA: tanA,
                 clampA: clampA,
                 fractA: fractA,
                 rampA: rampA,
                 signA: signA,
                 sumA: sumA,
                 sampleLinearA: sampleLinearA,
                 sampleLinearRepeatA: sampleLinearRepeatA,
                 sampleCubicA: sampleCubicA,
                 sampleCubicRepeatA: sampleCubicRepeatA,
               }
    };

    var ArrayMathAsm = ctor({Math: Math, Float32Array: Float32Array, Uint32Array: Uint32Array, Infinity}, {round: Math.round}, HEAP);

    var ArrayMath = {};

    ArrayMath.Float32Array = function (size) {
        var ta = new Float32Array(HEAP, top, size);
        top += ta.byteLength;
        return ta;
    }

    ArrayMath.add = function (dst, x, y) {
        if (x instanceof Float32Array)
            ArrayMathAsm.addA(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
        else
            ArrayMathAsm.addS(dst.byteOffset, x, y.byteOffset, Math.min(dst.length, y.length));
    };

    ArrayMath.sub = function (dst, x, y) {
        if (x instanceof Float32Array)
            ArrayMathAsm.subA(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
        else
            ArrayMathAsm.subS(dst.byteOffset, x, y.byteOffset, Math.min(dst.length, y.length));
    };

    ArrayMath.mul = function (dst, x, y) {
        if (x instanceof Float32Array)
            ArrayMathAsm.mulA(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
        else
            ArrayMathAsm.mulS(dst.byteOffset, x, y.byteOffset, Math.min(dst.length, y.length));
    };

    ArrayMath.mulCplx = function (dstReal, dstImag, xReal, xImag, yReal, yImag) {
        if (xReal instanceof Float32Array)
            ArrayMathAsm.mulCplxA(dstReal.byteOffset, dstImag.byteOffset, xReal.byteOffset, xImag.byteOffset, yReal.byteOffset, yImag.byteOffset, Math.min(dstReal.length, dstImag.length, xReal.length, xImag.length, yReal.length, yImag.length));
        else
            ArrayMathAsm.mulCplxS(dstReal.byteOffset, dstImag.byteOffset, xReal, xImag, yReal.byteOffset, yImag.byteOffset, Math.min(dstReal.length, dstImag.length, yReal.length, yImag.length));
    };

    ArrayMath.div = function (dst, x, y) {
        if (x instanceof Float32Array)
            ArrayMathAsm.divA(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
        else
            ArrayMathAsm.divS(dst.byteOffset, x, y.byteOffset, Math.min(dst.length, y.length));
    };

    ArrayMath.divCplx = function (dstReal, dstImag, xReal, xImag, yReal, yImag) {
        if (xReal instanceof Float32Array)
            ArrayMathAsm.divCplxA(dstReal.byteOffset, dstImag.byteOffset, xReal.byteOffset, xImag.byteOffset, yReal.byteOffset, yImag.byteOffset, Math.min(dstReal.length, dstImag.length, xReal.length, xImag.length, yReal.length, yImag.length));
        else
            ArrayMathAsm.divCplxS(dstReal.byteOffset, dstImag.byteOffset, xReal, xImag, yReal.byteOffset, yImag.byteOffset, Math.min(dstReal.length, dstImag.length, yReal.length, yImag.length));

    };

    ArrayMath.madd = function (dst, x, y, z) {
        if (x instanceof Float32Array)
            ArrayMathAsm.maddA(dst.byteOffset, x.byteOffset, y.byteOffset, z.byteOffset, Math.min(dst.length, x.length, y.length, z.length));
        else
            ArrayMathAsm.maddS(dst.byteOffset, x, y.byteOffset, z.byteOffset, Math.min(dst.length, y.length, z.length));
    };

    ArrayMath.abs = function (dst, x) {
        ArrayMathAsm.absA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.absCplx = function (dst, real, imag) {
        ArrayMathAsm.absCplxA(dst.byteOffset, real.byteOffset, imag.byteOffset, Math.min(dst.length, real.length, imag.length));
    };

    ArrayMath.acos = function (dst, x) {
        ArrayMathAsm.acosA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.asin = function (dst, x) {
        ArrayMathAsm.asinA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.atan = function (dst, x) {
        ArrayMathAsm.atanA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.atan2 = function (dst, x, y) {
        ArrayMathAsm.atan2A(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
    };

    ArrayMath.ceil = function (dst, x) {
        ArrayMathAsm.ceilA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.cos = function (dst, x) {
        ArrayMathAsm.cosA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.exp = function (dst, x) {
        ArrayMathAsm.expA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.floor = function (dst, x) {
        ArrayMathAsm.floorA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.log = function (dst, x) {
        ArrayMathAsm.logA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.max = function (x) {
        return ArrayMathAsm.maxA(x.byteOffset, x.length);
    };

    ArrayMath.min = function (x) {
        return ArrayMathAsm.minA(x.byteOffset, x.length);
    };

    ArrayMath.pow = function (dst, x, y) {
        if (y instanceof Float32Array)
            ArrayMathAsm.powA(dst.byteOffset, x.byteOffset, y.byteOffset, Math.min(dst.length, x.length, y.length));
        else
            ArrayMathAsm.powS(dst.byteOffset, x.byteOffset, y, Math.min(dst.length, x.length));
    };

    ArrayMath.random = function (dst, low, high) {
        if (!low)
            low = 0;
        if (isNaN(parseFloat(high)))
            high = 1;
        ArrayMathAsm.randomA(dst.byteOffset, low, high, dst.length, Math.random() * 0x100000000);
    };

    ArrayMath.round = function (dst, x) {
        ArrayMathAsm.roundA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.sin = function (dst, x) {
        ArrayMathAsm.sinA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.sqrt = function (dst, x) {
        ArrayMathAsm.sqrtA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.tan = function (dst, x) {
        ArrayMathAsm.tanA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.clamp = function (dst, x, xMin, xMax) {
        ArrayMathAsm.clampA(dst.byteOffset, x.byteOffset, xMin, xMax, Math.min(dst.length, x.length));
    };

    ArrayMath.fract = function (dst, x) {
        ArrayMathAsm.fractA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.fill = function (dst, value) {
        dst.fill(value);
    };

    ArrayMath.ramp = function (dst, first, last) {
        ArrayMathAsm.rampA(dst.byteOffset, first, last, dst.length);
    };

    ArrayMath.sign = function (dst, x) {
        ArrayMathAsm.signA(dst.byteOffset, x.byteOffset, Math.min(dst.length, x.length));
    };

    ArrayMath.sum = function (x) {
        // TODO(m): We should use pairwise summation or similar here.
        return ArrayMathAsm.sumA(x.byteOffset, x.length);
    };

    ArrayMath.sampleLinear = function (dst, x, t) {
        ArrayMathAsm.sampleLinearA(dst.byteOffset, x.byteOffset, t.byteOffset, x.length - 1, Math.min(dst.length, t.length));
    };

    ArrayMath.sampleLinearRepeat = function (dst, x, t) {
        ArrayMathAsm.sampleLinearRepeatA(dst.byteOffset, x.byteOffset, t.byteOffset, x.length - 1, Math.min(dst.length, t.length));
    };

    ArrayMath.sampleCubic = function (dst, x, t) {
        ArrayMathAsm.sampleCubicA(dst.byteOffset, x.byteOffset, t.byteOffset, x.length - 1, Math.min(dst.length, t.length));
    };

    ArrayMath.sampleCubicRepeat = function (dst, x, t) {
        var xLen = x.length, maxIdx = xLen - 1;
        for (var k = Math.min(dst.length, t.length) - 1; k >= 0; --k) {
            var t2 = t[k];
            t2 = t2 - Math.floor(t2/xLen) * xLen;
            var idx = Math.floor(t2);
            var w = t2 - idx;
            var w2 = w * w;
            var w3 = w2 * w;
            var h2 = -2*w3 + 3*w2;
            var h1 = 1 - h2;
            var h4 = w3 - w2;
            var h3 = h4 - w2 + w;
            var p1 = x[idx > 0 ? idx - 1 : maxIdx];
            var p2 = x[idx];
            var p3 = x[idx < maxIdx ? idx + 1 : 0];
            var p4 = x[idx < maxIdx - 1 ? idx + 2 : (idx + 2 - Math.floor((idx + 2)/xLen) * xLen)];
            dst[k] = h1 * p2 + h2 * p3 + 0.5 * (h3 * (p3 - p1) + h4 * (p4 - p2));
        }
    };

    ArrayMath.pack = function (dst, offset, stride, src1, src2, src3, src4) {
        var dstCount = Math.floor(Math.max(0, (dst.length - offset)) / stride);
        var count = Math.min(dstCount, src1.length);
        if (src2) {
            var count = Math.min(count, src2.length);
            if (src3) {
                var count = Math.min(count, src3.length);
                if (src4) {
                    var count = Math.min(count, src4.length);
                    for (var k = 0; k < count; ++k) {
                        dst[offset] = src1[k];
                        dst[offset + 1] = src2[k];
                        dst[offset + 2] = src3[k];
                        dst[offset + 3] = src4[k];
                        offset += stride;
                    }
                }
                else
                    for (var k = 0; k < count; ++k) {
                        dst[offset] = src1[k];
                        dst[offset + 1] = src2[k];
                        dst[offset + 2] = src3[k];
                        offset += stride;
                    }
            }
            else
                for (var k = 0; k < count; ++k) {
                    dst[offset] = src1[k];
                    dst[offset + 1] = src2[k];
                    offset += stride;
                }
        }
        else
            for (var k = 0; k < count; ++k) {
                dst[offset] = src1[k];
                offset += stride;
            }
    };

    ArrayMath.unpack = function (src, offset, stride, dst1, dst2, dst3, dst4) {
        var srcCount = Math.floor(Math.max(0, (src.length - offset)) / stride);
        var count = Math.min(srcCount, dst1.length);
        if (dst2) {
            var count = Math.min(count, dst2.length);
            if (dst3) {
                var count = Math.min(count, dst3.length);
                if (dst4) {
                    var count = Math.min(count, dst4.length);
                    for (var k = 0; k < count; ++k) {
                        dst1[k] = src[offset];
                        dst2[k] = src[offset + 1];
                        dst3[k] = src[offset + 2];
                        dst4[k] = src[offset + 3];
                        offset += stride;
                    }
                }
                else
                    for (var k = 0; k < count; ++k) {
                        dst1[k] = src[offset];
                        dst2[k] = src[offset + 1];
                        dst3[k] = src[offset + 2];
                        offset += stride;
                    }
            }
            else
                for (var k = 0; k < count; ++k) {
                    dst1[k] = src[offset];
                    dst2[k] = src[offset + 1];
                    offset += stride;
                }
        }
        else
            for (var k = 0; k < count; ++k) {
                dst1[k] = src[offset];
                offset += stride;
            }
    };

    context.ArrayMath = ArrayMath;
})(this);


//------------------------------------------------------------------------------
// interface Filter
//------------------------------------------------------------------------------

(function () {
    if (context.Filter) return;

    var Filter = function (bSize, aSize) {
        if (isNaN(parseFloat(bSize)) || !isFinite(bSize))
            bSize = 1;
        if (!aSize)
            aSize = 0;
        this._b = new Float32Array(bSize);
        this._b[0] = 1;
        this._a = new Float32Array(aSize);
        this._bHist = new Float32Array(bSize);
        this._aHist = new Float32Array(aSize);
    };

    Filter.prototype.filter = function (dst, x) {
        // Put commonly accessed objects and properties in local variables
        var a = this._a, aLen = a.length,
        b = this._b, bLen = b.length,
        aHist = this._aHist, bHist = this._bHist,
        xLen = x.length, dstLen = dst.length;

        // Perform run-in part using the history (slow)
        var bHistRunIn = bLen - 1;
        var aHistRunIn = aLen;
        var k;
        for (k = 0; (bHistRunIn || aHistRunIn) && k < xLen; ++k) {
            var m, noHistLen;

            // FIR part
            noHistLen = bLen - bHistRunIn;
            bHistRunIn && bHistRunIn--;
            var res = b[0] * x[k];
            for (m = 1; m < noHistLen; ++m)
                res += b[m] * x[k - m];
            for (; m < bLen; ++m)
                res += b[m] * bHist[m - noHistLen];

            // Recursive part
            noHistLen = aLen - aHistRunIn;
            aHistRunIn && aHistRunIn--;
            for (m = 0; m < noHistLen; ++m)
                res -= a[m] * dst[k - 1 - m];
            for (; m < aLen; ++m)
                res -= a[m] * aHist[m - noHistLen];

            dst[k] = res;
        }

        // Perform history-free part (fast)
        if (bLen == 3 && aLen == 2) {
            // Optimized special case: biquad filter
            var b0 = b[0], b1 = b[1], b2 = b[2], a1 = a[0], a2 = a[1];
            var x0 = x[k-1], x1 = x[k-2], x2;
            var y0 = dst[k-1], y1 = dst[k-2], y2;
            for (; k < xLen; ++k) {
                x2 = x1;
                x1 = x0;
                x0 = x[k];
                y2 = y1;
                y1 = y0;
                y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
                dst[k] = y0;
            }
        }
        else {
            // Generic case
            for (; k < xLen; ++k) {
                var m;

                // FIR part
                var res = b[0] * x[k];
                for (m = 1; m < bLen; ++m)
                    res += b[m] * x[k - m];

                // Recursive part
                for (m = 0; m < aLen; ++m)
                    res -= a[m] * dst[k - 1 - m];

                dst[k] = res;
            }
        }

        // Update history state
        var histCopy = Math.min(bLen - 1, xLen);
        for (k = bLen - 2; k >= histCopy; --k)
            bHist[k] = bHist[k - histCopy];
        for (k = 0; k < histCopy; ++k)
            bHist[k] = x[xLen - 1 - k];
        histCopy = Math.min(aLen, dstLen);
        for (k = aLen - 1; k >= histCopy; --k)
            aHist[k] = aHist[k - histCopy];
        for (k = 0; k < histCopy; ++k)
            aHist[k] = dst[xLen - 1 - k];
    };

    Filter.prototype.clearHistory = function () {
        for (var k = this._bHist.length - 1; k >= 0; --k)
            this._bHist[k] = 0;
        for (var k = this._aHist.length - 1; k >= 0; --k)
            this._aHist[k] = 0;
    };

    Filter.prototype.setB = function (values) {
        var len = Math.min(this._b.length, values.length);
        for (var k = 0; k < len; ++k)
            this._b[k] = values[k];
    };

    Filter.prototype.setA = function (values) {
        var len = Math.min(this._a.length, values.length);
        for (var k = 0; k < len; ++k)
            this._a[k] = values[k];
    };

    context.Filter = Filter;
})();


//------------------------------------------------------------------------------
// interface FFT
//
// NOTE: This is essentially a hand-translation of the C language Kiss FFT
// library, copyright by Mark Borgerding, relicensed with permission from the
// author.
//
// The algorithm implements mixed radix FFT and supports transforms of any size
// (not just powers of 2). For optimal performance, use sizes that can be
// factorized into factors 2, 3, 4 and 5.
//------------------------------------------------------------------------------

(function () {
    if (context.FFT) return;

    var butterfly2 = function (outRe, outIm, outIdx, stride, twRe, twIm, m) {
        var scratch0Re, scratch0Im,
        out0Re, out0Im, out1Re, out1Im,
        tRe, tIm;

        var tw1 = 0,
        idx0 = outIdx,
        idx1 = outIdx + m;

        var scale = 0.7071067811865475; // sqrt(1/2)
        var idx0End = idx0 + m;
        while (idx0 < idx0End) {
            // out0 = out[idx0] / sqrt(2)
            out0Re = outRe[idx0] * scale;
            out0Im = outIm[idx0] * scale;
            // out1 = out[idx1] / sqrt(2)
            out1Re = outRe[idx1] * scale;
            out1Im = outIm[idx1] * scale;

            // scratch0 = out1 * tw[tw1]
            tRe = twRe[tw1]; tIm = twIm[tw1];
            scratch0Re = out1Re * tRe - out1Im * tIm;
            scratch0Im = out1Re * tIm + out1Im * tRe;

            // out[idx1] = out0 - scratch0
            outRe[idx1] = out0Re - scratch0Re;
            outIm[idx1] = out0Im - scratch0Im;

            // out[idx0] = out0 + scratch0
            outRe[idx0] = out0Re + scratch0Re;
            outIm[idx0] = out0Im + scratch0Im;

            tw1 += stride;
            ++idx0; ++idx1;
        }
    };

    var butterfly3 = function (outRe, outIm, outIdx, stride, twRe, twIm, m) {
        var scratch0Re, scratch0Im, scratch1Re, scratch1Im,
        scratch2Re, scratch2Im, scratch3Re, scratch3Im,
        out0Re, out0Im, out1Re, out1Im, out2Re, out2Im,
        tRe, tIm;

        var tw1 = 0,
        tw2 = 0,
        stride2 = 2 * stride,
        idx0 = outIdx,
        idx1 = outIdx + m,
        idx2 = outIdx + 2 * m;

        var epi3Im = twIm[stride*m];

        var scale = 0.5773502691896258; // sqrt(1/3)
        var idx0End = idx0 + m;
        while (idx0 < idx0End) {
            // out0 = out[idx0] / sqrt(3)
            out0Re = outRe[idx0] * scale;
            out0Im = outIm[idx0] * scale;
            // out1 = out[idx1] / sqrt(3)
            out1Re = outRe[idx1] * scale;
            out1Im = outIm[idx1] * scale;
            // out2 = out[idx2] / sqrt(3)
            out2Re = outRe[idx2] * scale;
            out2Im = outIm[idx2] * scale;

            // scratch1 = out1 * tw[tw1]
            tRe = twRe[tw1]; tIm = twIm[tw1];
            scratch1Re = out1Re * tRe - out1Im * tIm;
            scratch1Im = out1Re * tIm + out1Im * tRe;

            // scratch2 = out2 * tw[tw2]
            tRe = twRe[tw2]; tIm = twIm[tw2];
            scratch2Re = out2Re * tRe - out2Im * tIm;
            scratch2Im = out2Re * tIm + out2Im * tRe;

            // scratch3 = scratch1 + scratch2
            scratch3Re = scratch1Re + scratch2Re;
            scratch3Im = scratch1Im + scratch2Im;

            // scratch0 = scratch1 - scratch2
            scratch0Re = scratch1Re - scratch2Re;
            scratch0Im = scratch1Im - scratch2Im;

            // out1 = out0 - scratch3 / 2
            out1Re = out0Re - scratch3Re * 0.5;
            out1Im = out0Im - scratch3Im * 0.5;

            // scratch0 *= epi3.i
            scratch0Re *= epi3Im;
            scratch0Im *= epi3Im;

            // out[idx0] = out0 + scratch3
            outRe[idx0] = out0Re + scratch3Re;
            outIm[idx0] = out0Im + scratch3Im;

            outRe[idx2] = out1Re + scratch0Im;
            outIm[idx2] = out1Im - scratch0Re;

            outRe[idx1] = out1Re - scratch0Im;
            outIm[idx1] = out1Im + scratch0Re;

            tw1 += stride; tw2 += stride2;
            ++idx0; ++idx1; ++idx2;
        }
    };

    var butterfly4 = function (outRe, outIm, outIdx, stride, twRe, twIm, m, inverse) {
        var scratch0Re, scratch0Im, scratch1Re, scratch1Im, scratch2Re, scratch2Im,
        scratch3Re, scratch3Im, scratch4Re, scratch4Im, scratch5Re, scratch5Im,
        out0Re, out0Im, out1Re, out1Im, out2Re, out2Im, out3Re, out3Im,
        tRe, tIm;

        var tw1 = 0,
        tw2 = 0,
        tw3 = 0,
        stride2 = 2 * stride,
        stride3 = 3 * stride,
        idx0 = outIdx,
        idx1 = outIdx + m,
        idx2 = outIdx + 2 * m,
        idx3 = outIdx + 3 * m;

        var scale = 0.5; // sqrt(1/4)
        var idx0End = idx0 + m;
        while (idx0 < idx0End) {
            // out0 = out[idx0] / sqrt(4)
            out0Re = outRe[idx0] * scale;
            out0Im = outIm[idx0] * scale;
            // out1 = out[idx1] / sqrt(4)
            out1Re = outRe[idx1] * scale;
            out1Im = outIm[idx1] * scale;
            // out2 = out[idx2] / sqrt(4)
            out2Re = outRe[idx2] * scale;
            out2Im = outIm[idx2] * scale;
            // out3 = out[idx3] / sqrt(4)
            out3Re = outRe[idx3] * scale;
            out3Im = outIm[idx3] * scale;

            // scratch0 = out1 * tw[tw1]
            tRe = twRe[tw1]; tIm = twIm[tw1];
            scratch0Re = out1Re * tRe - out1Im * tIm;
            scratch0Im = out1Re * tIm + out1Im * tRe;

            // scratch1 = out2 * tw[tw2]
            tRe = twRe[tw2]; tIm = twIm[tw2];
            scratch1Re = out2Re * tRe - out2Im * tIm;
            scratch1Im = out2Re * tIm + out2Im * tRe;

            // scratch2 = out3 * tw[tw3]
            tRe = twRe[tw3]; tIm = twIm[tw3];
            scratch2Re = out3Re * tRe - out3Im * tIm;
            scratch2Im = out3Re * tIm + out3Im * tRe;

            // scratch5 = out0 - scratch1
            scratch5Re = out0Re - scratch1Re;
            scratch5Im = out0Im - scratch1Im;

            // out0 += scratch1
            out0Re += scratch1Re;
            out0Im += scratch1Im;

            // scratch3 = scratch0 + scratch2
            scratch3Re = scratch0Re + scratch2Re;
            scratch3Im = scratch0Im + scratch2Im;

            // scratch4 = scratch0 - scratch2
            scratch4Re = scratch0Re - scratch2Re;
            scratch4Im = scratch0Im - scratch2Im;

            // out[idx2] = out0 - scratch3
            outRe[idx2] = out0Re - scratch3Re;
            outIm[idx2] = out0Im - scratch3Im;

            // out[idx0] = out0 + scratch3
            outRe[idx0] = out0Re + scratch3Re;
            outIm[idx0] = out0Im + scratch3Im;

            if (inverse) {
                outRe[idx1] = scratch5Re - scratch4Im;
                outIm[idx1] = scratch5Im + scratch4Re;
                outRe[idx3] = scratch5Re + scratch4Im;
                outIm[idx3] = scratch5Im - scratch4Re;
            }
            else {
                outRe[idx1] = scratch5Re + scratch4Im;
                outIm[idx1] = scratch5Im - scratch4Re;
                outRe[idx3] = scratch5Re - scratch4Im;
                outIm[idx3] = scratch5Im + scratch4Re;
            }

            tw1 += stride; tw2 += stride2; tw3 += stride3;
            ++idx0; ++idx1; ++idx2; ++idx3;
        }
    };

    var butterfly5 = function (outRe, outIm, outIdx, stride, twRe, twIm, m) {
        var scratch0Re, scratch0Im, scratch1Re, scratch1Im, scratch2Re, scratch2Im,
        scratch3Re, scratch3Im, scratch4Re, scratch4Im, scratch5Re, scratch5Im,
        scratch6Re, scratch6Im, scratch7Re, scratch7Im, scratch8Re, scratch8Im,
        scratch9Re, scratch9Im, scratch10Re, scratch10Im, scratch11Re, scratch11Im,
        scratch12Re, scratch12Im,
        out0Re, out0Im, out1Re, out1Im, out2Re, out2Im, out3Re, out3Im, out4Re, out4Im,
        tRe, tIm;

        var tw1 = 0,
        tw2 = 0,
        tw3 = 0,
        tw4 = 0,
        stride2 = 2 * stride,
        stride3 = 3 * stride,
        stride4 = 4 * stride;

        var idx0 = outIdx,
        idx1 = outIdx + m,
        idx2 = outIdx + 2 * m,
        idx3 = outIdx + 3 * m,
        idx4 = outIdx + 4 * m;

        // ya = tw[stride*m];
        var yaRe = twRe[stride * m],
        yaIm = twIm[stride * m];
        // yb = tw[stride*2*m];
        var ybRe = twRe[stride * 2 * m],
        ybIm = twIm[stride * 2 * m];

        var scale = 0.4472135954999579; // sqrt(1/5)
        var idx0End = idx0 + m;
        while (idx0 < idx0End) {
            // out0 = out[idx0] / sqrt(5)
            out0Re = outRe[idx0] * scale;
            out0Im = outIm[idx0] * scale;
            // out1 = out[idx1] / sqrt(5)
            out1Re = outRe[idx1] * scale;
            out1Im = outIm[idx1] * scale;
            // out2 = out[idx2] / sqrt(5)
            out2Re = outRe[idx2] * scale;
            out2Im = outIm[idx2] * scale;
            // out3 = out[idx3] / sqrt(5)
            out3Re = outRe[idx3] * scale;
            out3Im = outIm[idx3] * scale;
            // out4 = out[idx4] / sqrt(5)
            out4Re = outRe[idx4] * scale;
            out4Im = outIm[idx4] * scale;

            // scratch0 = out0;
            scratch0Re = out0Re;
            scratch0Im = out0Im;

            // scratch1 = out1 * tw[tw1]
            tRe = twRe[tw1]; tIm = twIm[tw1];
            scratch1Re = out1Re * tRe - out1Im * tIm;
            scratch1Im = out1Re * tIm + out1Im * tRe;
            // scratch2 = out2 * tw[tw2]
            tRe = twRe[tw2]; tIm = twIm[tw2];
            scratch2Re = out2Re * tRe - out2Im * tIm;
            scratch2Im = out2Re * tIm + out2Im * tRe;
            // scratch3 = out3 * tw[tw3]
            tRe = twRe[tw3]; tIm = twIm[tw3];
            scratch3Re = out3Re * tRe - out3Im * tIm;
            scratch3Im = out3Re * tIm + out3Im * tRe;
            // scratch4 = out4 * tw[tw4]
            tRe = twRe[tw4]; tIm = twIm[tw4];
            scratch4Re = out4Re * tRe - out4Im * tIm;
            scratch4Im = out4Re * tIm + out4Im * tRe;

            // scratch7 = scratch1 + scratch4
            scratch7Re = scratch1Re + scratch4Re;
            scratch7Im = scratch1Im + scratch4Im;
            // scratch10 = scratch1 - scratch4
            scratch10Re = scratch1Re - scratch4Re;
            scratch10Im = scratch1Im - scratch4Im;
            // scratch8 = scratch2 + scratch2
            scratch8Re = scratch2Re + scratch3Re;
            scratch8Im = scratch2Im + scratch3Im;
            // scratch9 = scratch2 - scratch3
            scratch9Re = scratch2Re - scratch3Re;
            scratch9Im = scratch2Im - scratch3Im;

            // out[idx0] = out0 + scratch7 + scratch8
            outRe[idx0] = out0Re + scratch7Re + scratch8Re;
            outIm[idx0] = out0Im + scratch7Im + scratch8Im;

            scratch5Re = scratch0Re + scratch7Re * yaRe + scratch8Re * ybRe;
            scratch5Im = scratch0Im + scratch7Im * yaRe + scratch8Im * ybRe;

            scratch6Re = scratch10Im * yaIm + scratch9Im * ybIm;
            scratch6Im = -scratch10Re * yaIm - scratch9Re * ybIm;

            // out[idx1] = scratch5 - scratch6
            outRe[idx1] = scratch5Re - scratch6Re;
            outIm[idx1] = scratch5Im - scratch6Im;
            // out[idx4] = scratch5 + scratch6
            outRe[idx4] = scratch5Re + scratch6Re;
            outIm[idx4] = scratch5Im + scratch6Im;

            scratch11Re = scratch0Re + scratch7Re * ybRe + scratch8Re * yaRe;
            scratch11Im = scratch0Im + scratch7Im * ybRe + scratch8Im * yaRe;

            scratch12Re = -scratch10Im * ybIm + scratch9Im * yaIm;
            scratch12Im = scratch10Re * ybIm - scratch9Re * yaIm;

            // out[idx2] = scratch11 + scratch12
            outRe[idx2] = scratch11Re + scratch12Re;
            outIm[idx2] = scratch11Im + scratch12Im;
            // out[idx3] = scratch11 - scratch12
            outRe[idx3] = scratch11Re - scratch12Re;
            outIm[idx3] = scratch11Im - scratch12Im;

            tw1 += stride; tw2 += stride2; tw3 += stride3; tw4 += stride4;
            ++idx0; ++idx1; ++idx2; ++idx3; ++idx4;
        }
    };

    var butterflyN = function (outRe, outIm, outIdx, stride, twRe, twIm, m, p, size) {
        var u, q1, q, idx0;
        var out0Re, out0Im, aRe, aIm, tRe, tIm;

        // FIXME: Allocate statically
        var scratchRe = new Float32Array(p);
        var scratchIm = new Float32Array(p);

        var scale = Math.sqrt(1 / p);
        for (u = 0; u < m; ++u) {
            idx0 = outIdx + u;
            for (q1 = 0; q1 < p; ++q1) {
                // scratch[q1] = out[idx0] / sqrt(p)
                scratchRe[q1] = outRe[idx0] * scale;
                scratchIm[q1] = outIm[idx0] * scale;
                idx0 += m;
            }

            idx0 = outIdx + u;
            var tw1Incr = stride * u;
            for (q1 = 0; q1 < p; ++q1) {
                // out0 = scratch[0]
                out0Re = scratchRe[0];
                out0Im = scratchIm[0];

                var tw1 = 0;
                for (q = 1; q < p; ++q) {
                    tw1 += tw1Incr;
                    if (tw1 >= size)
                        tw1 -= size;

                    // out0 += scratch[q] * tw[tw1]
                    aRe = scratchRe[q], aIm = scratchIm[q];
                    tRe = twRe[tw1], tIm = twIm[tw1];
                    out0Re += aRe * tRe - aIm * tIm;
                    out0Im += aRe * tIm + aIm * tRe;
                }

                // out[idx0] = out0
                outRe[idx0] = out0Re;
                outIm[idx0] = out0Im;

                idx0 += m;
                tw1Incr += stride;
            }
        }
    };

    var work = function (outRe, outIm, outIdx, fRe, fIm, fIdx, stride, inStride, factors, factorsIdx, twRe, twIm, size, inverse) {
        var p = factors[factorsIdx++];  // Radix
        var m = factors[factorsIdx++];  // Stage's FFT length / p

        var outIdxBeg = outIdx;
        var outIdxEnd = outIdx + p * m;

        var fIdxIncr = stride * inStride;
        if (m == 1) {
            do {
                outRe[outIdx] = fRe[fIdx];
                outIm[outIdx] = fIm[fIdx];
                fIdx += fIdxIncr;
                ++outIdx;
            }
            while (outIdx != outIdxEnd);
        }
        else {
            do {
                // DFT of size m*p performed by doing p instances of smaller DFTs of
                // size m, each one takes a decimated version of the input.
                work(outRe, outIm, outIdx, fRe, fIm, fIdx, stride * p, inStride, factors, factorsIdx, twRe, twIm, size, inverse);
                fIdx += fIdxIncr;
                outIdx += m;
            }
            while (outIdx != outIdxEnd);
        }

        outIdx = outIdxBeg;

        // Recombine the p smaller DFTs
        switch (p) {
        case 2:  butterfly2(outRe, outIm, outIdx, stride, twRe, twIm, m); break;
        case 3:  butterfly3(outRe, outIm, outIdx, stride, twRe, twIm, m); break;
        case 4:  butterfly4(outRe, outIm, outIdx, stride, twRe, twIm, m, inverse); break;
        case 5:  butterfly5(outRe, outIm, outIdx, stride, twRe, twIm, m); break;
        default: butterflyN(outRe, outIm, outIdx, stride, twRe, twIm, m, p, size); break;
        }
    };

    /*  facBuf is populated by p1,m1,p2,m2, ...
        where
        p[i] * m[i] = m[i-1]
        m0 = n                  */
    var factor = function (n, facBuf) {
        // Factor out powers of 4, powers of 2, then any remaining primes
        var p = 4;
        var floorSqrt = Math.floor(Math.sqrt(n));
        var idx = 0;
        do {
            while (n % p) {
                switch (p) {
                case 4:  p = 2; break;
                case 2:  p = 3; break;
                default: p += 2; break;
                }
                if (p > floorSqrt)
                    p = n;
            }
            n = Math.floor(n / p);
            facBuf[idx++] = p;
            facBuf[idx++] = n;
        }
        while (n > 1);
    };

    var FFT = function (size) {
        if (!size)
            size = 256;
        Object.defineProperty(this, "size", {
            configurable: false,
            writable: false,
            value: size
        });

        // Allocate arrays for twiddle factors
        this._twiddlesFwdRe = new Float32Array(size);
        this._twiddlesFwdIm = new Float32Array(size);
        this._twiddlesInvRe = this._twiddlesFwdRe;
        this._twiddlesInvIm = new Float32Array(size);

        // Init twiddle factors (both forward & reverse)
        for (var i = 0; i < size; ++i) {
            var phase = -2 * Math.PI * i / size;
            var cosPhase = Math.cos(phase), sinPhase = Math.sin(phase);
            this._twiddlesFwdRe[i] = cosPhase;
            this._twiddlesFwdIm[i] = sinPhase;
            this._twiddlesInvIm[i] = -sinPhase;
        }

        // Allocate arrays for radix plan
        this._factors = new Int32Array(2 * 32);  // MAXFACTORS = 32

        // Init radix factors (mixed radix breakdown)
        // FIXME: Something seems to go wrong when using an FFT size that can be
        // factorized into more than one butterflyN (e.g. try an FFT size of 11*13).
        factor(size, this._factors);
    };

    FFT.prototype.forwardCplx = function (dstReal, dstImag, xReal, xImag) {
        var twRe = this._twiddlesFwdRe;
        var twIm = this._twiddlesFwdIm;
        work(dstReal, dstImag, 0, xReal, xImag, 0, 1, 1, this._factors, 0, twRe, twIm, this.size, false);
    };

    FFT.prototype.forward = function (dstReal, dstImag, x) {
        // FIXME: Optimize this case (real input signal)
        this.forwardCplx(dstReal, dstImag, x, new Float32Array(this.size));
    };

    FFT.prototype.inverseCplx = function (dstReal, dstImag, xReal, xImag) {
        var twRe = this._twiddlesInvRe;
        var twIm = this._twiddlesInvIm;
        work(dstReal, dstImag, 0, xReal, xImag, 0, 1, 1, this._factors, 0, twRe, twIm, this.size, true);
    };

    FFT.prototype.inverse = function (dst, xReal, xImag) {
        // FIXME: Optimize this case (real output signal)
        this.inverseCplx(dst, new Float32Array(this.size), xReal, xImag);
    };

    context.FFT = FFT;
})();
