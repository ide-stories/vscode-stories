import { executeChanges } from "../shared/text-utils";
import { fixtures } from "./fixtures";

Object.entries(fixtures).forEach((f) => {
  describe(f[0], () => {
    Object.entries(f[1]).forEach(([k, v]) => {
      it(k, () => {
        for (const [, steps] of v.recordingSteps) {
          executeChanges(v.startingChunks, steps);
        }
        expect(v.startingChunks).toEqual(v.endingChunks);
      });
    });
  });
});

export {};
