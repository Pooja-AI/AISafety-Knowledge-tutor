import { useState } from "react";

const ExplainableAI = [
  {
    id: "xai-landscape",
    category: "Foundations",
    title: "Explainability Landscape & Method Selection",
    difficulty: "Beginner",
    time: "~20 min",
    description:
      "Understand the major families of explainability methods and how to choose the right one for your model type, audience, and stakes.",
    tags: ["overview", "taxonomy", "method-selection"],
    steps: [
      { label: "Identify Stakeholders", icon: "👤", detail: "Determine who needs the explanation: engineer, regulator, or end user." },
      { label: "Classify Model Type", icon: "🧩", detail: "Distinguish glass-box (linear, trees) vs black-box (deep nets, ensembles)." },
      { label: "Choose Scope", icon: "🔭", detail: "Decide between global (whole-model) and local (single-prediction) explanations." },
      { label: "Match Method to Need", icon: "🎯", detail: "Pick feature attribution, example-based, or rule-based methods accordingly." },
      { label: "Validate Faithfulness", icon: "✅", detail: "Check explanations actually reflect model behavior, not just plausibility." },
      { label: "Communicate Results", icon: "🗣️", detail: "Translate technical output into stakeholder-appropriate language." },
    ],
    code: `const XAI_METHOD_LANDSCAPE = {
  intrinsic_interpretability: {
    linear_models: {
      description: "Coefficients directly indicate feature contribution",
      examples: ["logistic regression", "linear regression", "GLMs"],
      scope: "global",
      fidelity: "exact",
    },
    decision_trees: {
      description: "Explicit if-then rules from root to leaf",
      examples: ["CART", "single decision tree", "decision lists"],
      scope: "global_and_local",
      fidelity: "exact",
    },
    gams: {
      description: "Generalized additive models expose per-feature shape functions",
      examples: ["EBM", "spline-based GAM"],
      scope: "global",
      fidelity: "exact",
    },
  },

  post_hoc_local: {
    shap: {
      description: "Game-theoretic attribution of prediction to each feature",
      examples: ["KernelSHAP", "TreeSHAP", "DeepSHAP"],
      scope: "local",
      fidelity: "approximate",
    },
    lime: {
      description: "Fits interpretable surrogate around a single prediction",
      examples: ["tabular LIME", "text LIME", "image LIME"],
      scope: "local",
      fidelity: "approximate",
    },
    counterfactuals: {
      description: "Minimal input change that flips the prediction",
      examples: ["DiCE", "growing spheres", "Wachter counterfactuals"],
      scope: "local",
      fidelity: "exact_for_found_point",
    },
    anchors: {
      description: "High-precision if-then rule that 'anchors' a prediction",
      examples: ["anchor rules", "sufficient conditions"],
      scope: "local",
      fidelity: "approximate",
    },
  },

  post_hoc_global: {
    permutation_importance: {
      description: "Shuffle a feature and measure performance drop",
      examples: ["scikit-learn permutation importance"],
      scope: "global",
      fidelity: "approximate",
    },
    partial_dependence: {
      description: "Marginal effect of a feature averaged over the dataset",
      examples: ["PDP", "ALE plots"],
      scope: "global",
      fidelity: "approximate",
    },
    surrogate_models: {
      description: "Train an interpretable model to mimic the black box",
      examples: ["global tree surrogate", "rule extraction"],
      scope: "global",
      fidelity: "approximate",
    },
  },

  deep_learning_specific: {
    saliency_maps: {
      description: "Gradient of output with respect to input pixels/tokens",
      examples: ["vanilla gradients", "SmoothGrad", "Integrated Gradients"],
      scope: "local",
      fidelity: "approximate",
    },
    cam_methods: {
      description: "Class activation highlights over convolutional feature maps",
      examples: ["Grad-CAM", "Grad-CAM++", "Score-CAM"],
      scope: "local",
      fidelity: "approximate",
    },
    attention_visualization: {
      description: "Inspect learned attention weights in transformers",
      examples: ["attention rollout", "head-level attention maps"],
      scope: "local",
      fidelity: "contested",
    },
    probing_classifiers: {
      description: "Train small classifiers on internal activations to test what's encoded",
      examples: ["linear probes", "concept activation vectors (TCAV)"],
      scope: "global",
      fidelity: "approximate",
    },
  },
};

function recommendMethod(context) {
  const recommendations = {};

  for (const [family, methods] of Object.entries(XAI_METHOD_LANDSCAPE)) {
    recommendations[family] = {};

    for (const [method, details] of Object.entries(methods)) {
      const suitabilityScore =
        (details.scope === context.desiredScope || details.scope === "global_and_local" ? 2 : 0) +
        (details.fidelity === "exact" ? 2 : details.fidelity === "exact_for_found_point" ? 1.5 : 1);

      recommendations[family][method] = {
        ...details,
        suitability_score: suitabilityScore,
        recommended: suitabilityScore >= 2.5,
      };
    }
  }

  return recommendations;
}`,
  },

  {
    id: "shap-attribution",
    category: "Attribution",
    title: "SHAP: Shapley Additive Explanations",
    difficulty: "Intermediate",
    time: "~35 min",
    description:
      "Compute game-theoretic feature attributions using SHAP values and interpret them for tabular, tree, and deep models.",
    tags: ["shap", "shapley", "feature-attribution"],
    steps: [
      { label: "Define Coalition Game", icon: "🎲", detail: "Treat features as players contributing to the prediction payout." },
      { label: "Choose Explainer", icon: "🧰", detail: "Pick TreeSHAP, KernelSHAP, or DeepSHAP based on model type." },
      { label: "Sample Background Set", icon: "📦", detail: "Select a reference distribution to marginalize absent features." },
      { label: "Compute Shapley Values", icon: "🧮", detail: "Estimate each feature's average marginal contribution." },
      { label: "Aggregate Globally", icon: "📊", detail: "Average absolute SHAP values across the dataset for global importance." },
      { label: "Visualize", icon: "🖼️", detail: "Render force plots, waterfall plots, and summary beeswarm plots." },
    ],
    code: `class ShapExplainer {
  constructor(model, backgroundData, config = {}) {
    this.model = model;
    this.background = backgroundData;
    this.numSamples = config.numSamples || 200;
    this.method = config.method || "kernel"; // 'tree' | 'kernel' | 'deep'
  }

  // KernelSHAP: model-agnostic, weighted linear regression over coalitions
  async explainKernel(instance) {
    const numFeatures = instance.length;
    const coalitions = this.sampleCoalitions(numFeatures, this.numSamples);

    const X = [];
    const y = [];
    const weights = [];

    for (const coalition of coalitions) {
      const maskedInput = this.applyCoalition(instance, coalition);
      const prediction = await this.model.predict(maskedInput);

      X.push(coalition);
      y.push(prediction);
      weights.push(this.shapKernelWeight(coalition, numFeatures));
    }

    // Weighted least squares to recover per-feature contributions
    const phi = this.weightedLeastSquares(X, y, weights);

    return {
      baseValue: await this.model.predict(this.backgroundMean()),
      shapValues: phi,
      instance,
    };
  }

  shapKernelWeight(coalition, numFeatures) {
    const coalitionSize = coalition.reduce((a, b) => a + b, 0);
    if (coalitionSize === 0 || coalitionSize === numFeatures) {
      return 1e6; // Force inclusion of empty/full coalitions
    }
    const denom =
      this.binomial(numFeatures, coalitionSize) *
      coalitionSize *
      (numFeatures - coalitionSize);
    return (numFeatures - 1) / denom;
  }

  // TreeSHAP: exact, polynomial-time for tree ensembles
  async explainTree(instance) {
    const trees = this.model.getTrees();
    const phi = new Array(instance.length).fill(0);

    for (const tree of trees) {
      const treeContributions = this.traverseTreeSHAP(tree, instance);
      for (let i = 0; i < phi.length; i++) {
        phi[i] += treeContributions[i];
      }
    }

    return {
      baseValue: this.model.getBaseValue(),
      shapValues: phi,
      instance,
    };
  }

  traverseTreeSHAP(tree, instance) {
    // Recursively track which paths the instance follows and
    // apportion credit for each split based on feature used
    const contributions = new Array(instance.length).fill(0);

    const recurse = (node, weight) => {
      if (node.isLeaf) {
        return node.value * weight;
      }

      const goesLeft = instance[node.featureIndex] <= node.threshold;
      const child = goesLeft ? node.left : node.right;
      const otherChild = goesLeft ? node.right : node.left;

      const childWeight = weight * (goesLeft ? node.leftCoverage : node.rightCoverage);
      const otherWeight = weight * (goesLeft ? node.rightCoverage : node.leftCoverage);

      contributions[node.featureIndex] +=
        (child.expectedValue - otherChild.expectedValue) * weight;

      return recurse(child, childWeight);
    };

    recurse(tree.root, 1.0);
    return contributions;
  }

  // Global importance: mean |SHAP value| across the dataset
  async globalImportance(dataset) {
    const featureCount = dataset[0].length;
    const totals = new Array(featureCount).fill(0);

    for (const instance of dataset) {
      const { shapValues } = await this.explain(instance);
      shapValues.forEach((v, i) => {
        totals[i] += Math.abs(v);
      });
    }

    return totals.map((t, i) => ({
      featureIndex: i,
      meanAbsShap: t / dataset.length,
    })).sort((a, b) => b.meanAbsShap - a.meanAbsShap);
  }

  async explain(instance) {
    if (this.method === "tree") return this.explainTree(instance);
    return this.explainKernel(instance);
  }

  applyCoalition(instance, coalition) {
    return instance.map((v, i) =>
      coalition[i] === 1 ? v : this.backgroundSample()[i]
    );
  }

  backgroundSample() {
    return this.background[Math.floor(Math.random() * this.background.length)];
  }

  backgroundMean() {
    const dim = this.background[0].length;
    return Array.from({ length: dim }, (_, i) =>
      this.background.reduce((s, row) => s + row[i], 0) / this.background.length
    );
  }

  sampleCoalitions(numFeatures, numSamples) {
    return Array.from({ length: numSamples }, () =>
      Array.from({ length: numFeatures }, () => (Math.random() > 0.5 ? 1 : 0))
    );
  }

  binomial(n, k) {
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 0; i < k; i++) result *= (n - i) / (i + 1);
    return result;
  }

  weightedLeastSquares(X, y, weights) {
    // Solve for phi in: y = phi_0 + sum(phi_i * x_i), weighted by SHAP kernel
    const n = X[0].length;
    const XtWX = Array.from({ length: n }, () => new Array(n).fill(0));
    const XtWy = new Array(n).fill(0);

    for (let row = 0; row < X.length; row++) {
      const w = weights[row];
      for (let i = 0; i < n; i++) {
        XtWy[i] += w * X[row][i] * y[row];
        for (let j = 0; j < n; j++) {
          XtWX[i][j] += w * X[row][i] * X[row][j];
        }
      }
    }

    return this.solveLinearSystem(XtWX, XtWy);
  }

  solveLinearSystem(A, b) {
    // Gaussian elimination
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
      }
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = A[k][i] / A[i][i];
        for (let j = i; j < n; j++) A[k][j] -= factor * A[i][j];
        b[k] -= factor * b[i];
      }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = b[i];
      for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j];
      x[i] = sum / A[i][i];
    }
    return x;
  }
}`,
  },

  {
    id: "lime-surrogate",
    category: "Attribution",
    title: "LIME: Local Interpretable Surrogates",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Explain individual predictions by fitting a locally faithful, interpretable surrogate model around a perturbed neighborhood.",
    tags: ["lime", "surrogate", "local-explanation"],
    steps: [
      { label: "Select Instance", icon: "🎯", detail: "Pick the specific prediction you want to explain." },
      { label: "Perturb Neighborhood", icon: "🌪️", detail: "Generate samples by toggling features on/off around the instance." },
      { label: "Weight by Proximity", icon: "📏", detail: "Give higher weight to samples closer to the original instance." },
      { label: "Fit Surrogate", icon: "📈", detail: "Train a sparse linear model on the weighted, perturbed samples." },
      { label: "Extract Top Features", icon: "🏆", detail: "Read off the surrogate's coefficients as local explanations." },
      { label: "Check Local Fidelity", icon: "🔬", detail: "Validate the surrogate approximates the black box near the instance." },
    ],
    code: `class LimeExplainer {
  constructor(model, config = {}) {
    this.model = model;
    this.numSamples = config.numSamples || 500;
    this.numFeatures = config.numFeatures || 10; // features kept in surrogate
    this.kernelWidth = config.kernelWidth || 0.25;
  }

  async explainInstance(instance, featureNames) {
    // Step 1: generate perturbed neighborhood
    const { samples, masks } = this.perturb(instance, this.numSamples);

    // Step 2: get black-box predictions for each perturbed sample
    const predictions = await Promise.all(
      samples.map((s) => this.model.predict(s))
    );

    // Step 3: weight samples by proximity to original instance
    const weights = masks.map((mask) =>
      this.exponentialKernel(this.distance(mask), this.kernelWidth)
    );

    // Step 4: fit sparse linear surrogate (Lasso-style feature selection)
    const selectedFeatures = this.selectFeatures(
      masks,
      predictions,
      weights,
      this.numFeatures
    );

    const surrogate = this.fitWeightedLinear(
      masks.map((m) => selectedFeatures.map((i) => m[i])),
      predictions,
      weights
    );

    return {
      instance,
      explanation: selectedFeatures.map((featIdx, i) => ({
        feature: featureNames ? featureNames[featIdx] : \`feature_\${featIdx}\`,
        weight: surrogate.coefficients[i],
      })).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
      intercept: surrogate.intercept,
      localFidelity: this.computeR2(masks, predictions, weights, surrogate, selectedFeatures),
    };
  }

  perturb(instance, numSamples) {
    const numFeatures = instance.length;
    const samples = [];
    const masks = [];

    for (let i = 0; i < numSamples; i++) {
      const mask = Array.from({ length: numFeatures }, () => (Math.random() > 0.5 ? 1 : 0));
      const perturbed = instance.map((v, idx) =>
        mask[idx] === 1 ? v : this.samplingReference(idx)
      );
      samples.push(perturbed);
      masks.push(mask);
    }

    return { samples, masks };
  }

  samplingReference(featureIndex) {
    // For tabular data: draw from marginal distribution or use a fixed
    // "off" value (0, mean, or a random training row's value)
    return 0;
  }

  distance(mask) {
    // Cosine distance from the "all features present" vector
    const onesCount = mask.reduce((a, b) => a + b, 0);
    return 1 - onesCount / mask.length;
  }

  exponentialKernel(distance, width) {
    return Math.sqrt(Math.exp(-(distance ** 2) / (width ** 2)));
  }

  selectFeatures(masks, predictions, weights, k) {
    // Forward selection: greedily add the feature that most reduces
    // weighted residual error, approximating Lasso-style sparsity
    const numFeatures = masks[0].length;
    const selected = [];
    let residuals = [...predictions];

    while (selected.length < k && selected.length < numFeatures) {
      let bestFeature = -1;
      let bestScore = -Infinity;

      for (let f = 0; f < numFeatures; f++) {
        if (selected.includes(f)) continue;
        const score = this.correlationScore(masks, residuals, weights, f);
        if (score > bestScore) {
          bestScore = score;
          bestFeature = f;
        }
      }

      selected.push(bestFeature);
      residuals = this.updateResiduals(masks, residuals, weights, selected);
    }

    return selected;
  }

  correlationScore(masks, residuals, weights, featureIdx) {
    let num = 0, denomA = 0, denomB = 0;
    for (let i = 0; i < masks.length; i++) {
      const x = masks[i][featureIdx];
      num += weights[i] * x * residuals[i];
      denomA += weights[i] * x * x;
      denomB += weights[i] * residuals[i] * residuals[i];
    }
    return Math.abs(num) / (Math.sqrt(denomA * denomB) + 1e-9);
  }

  updateResiduals(masks, residuals, weights, selected) {
    const partial = this.fitWeightedLinear(
      masks.map((m) => selected.map((i) => m[i])),
      residuals,
      weights
    );
    return masks.map((m, i) => {
      const pred = selected.reduce(
        (sum, feat, j) => sum + m[feat] * partial.coefficients[j],
        partial.intercept
      );
      return residuals[i] - pred;
    });
  }

  fitWeightedLinear(X, y, weights) {
    // Ridge-regularized weighted least squares for numerical stability
    const n = X[0].length;
    const lambda = 1e-3;
    const XtWX = Array.from({ length: n }, () => new Array(n).fill(0));
    const XtWy = new Array(n).fill(0);

    for (let row = 0; row < X.length; row++) {
      const w = weights[row];
      for (let i = 0; i < n; i++) {
        XtWy[i] += w * X[row][i] * y[row];
        for (let j = 0; j < n; j++) {
          XtWX[i][j] += w * X[row][i] * X[row][j];
        }
      }
    }
    for (let i = 0; i < n; i++) XtWX[i][i] += lambda;

    const coefficients = this.solveLinearSystem(XtWX, XtWy);
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;

    return { coefficients, intercept: meanY };
  }

  computeR2(masks, predictions, weights, surrogate, selectedFeatures) {
    const preds = masks.map((m) =>
      selectedFeatures.reduce(
        (sum, feat, j) => sum + m[feat] * surrogate.coefficients[j],
        surrogate.intercept
      )
    );
    const meanY = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const ssRes = predictions.reduce((s, y, i) => s + weights[i] * (y - preds[i]) ** 2, 0);
    const ssTot = predictions.reduce((s, y) => s + (y - meanY) ** 2, 0);
    return 1 - ssRes / (ssTot + 1e-9);
  }

  solveLinearSystem(A, b) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
      }
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];
      for (let k = i + 1; k < n; k++) {
        const factor = A[k][i] / A[i][i];
        for (let j = i; j < n; j++) A[k][j] -= factor * A[i][j];
        b[k] -= factor * b[i];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = b[i];
      for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j];
      x[i] = sum / A[i][i];
    }
    return x;
  }
}`,
  },

  {
    id: "counterfactual-explanations",
    category: "Attribution",
    title: "Counterfactual & Contrastive Explanations",
    difficulty: "Advanced",
    time: "~40 min",
    description:
      "Generate minimal, actionable changes to an input that would flip a model's decision, and validate their plausibility.",
    tags: ["counterfactual", "actionability", "recourse"],
    steps: [
      { label: "Define Target Outcome", icon: "🎯", detail: "Specify the desired flipped prediction (e.g., approved vs denied)." },
      { label: "Set Mutable Features", icon: "🔓", detail: "Mark which features a person could realistically change." },
      { label: "Optimize for Proximity", icon: "📏", detail: "Search for the nearest point that crosses the decision boundary." },
      { label: "Enforce Plausibility", icon: "🧭", detail: "Constrain candidates to stay within realistic data manifold." },
      { label: "Diversify Candidates", icon: "🔀", detail: "Generate multiple, diverse counterfactuals for different recourse paths." },
      { label: "Validate Actionability", icon: "✅", detail: "Confirm suggested changes are legally and practically feasible." },
    ],
    code: `class CounterfactualGenerator {
  constructor(model, config = {}) {
    this.model = model;
    this.mutableFeatures = config.mutableFeatures || []; // indices allowed to change
    this.featureRanges = config.featureRanges || {}; // per-feature valid bounds
    this.lambda = config.lambda || 0.5; // trade-off: proximity vs validity
    this.numDiverse = config.numDiverse || 3;
  }

  // Wachter-style gradient-based counterfactual search
  async generate(instance, targetLabel, iterations = 500) {
    let candidate = [...instance];
    const learningRate = 0.05;

    for (let iter = 0; iter < iterations; iter++) {
      const prediction = await this.model.predictProba(candidate);
      const validityLoss = this.crossEntropy(prediction, targetLabel);
      const proximityLoss = this.weightedL1(candidate, instance);

      const totalLoss = validityLoss + this.lambda * proximityLoss;

      const gradient = await this.estimateGradient(candidate, targetLabel);

      for (const idx of this.mutableFeatures) {
        candidate[idx] -= learningRate * gradient[idx];
        candidate[idx] = this.clipToRange(candidate[idx], idx);
      }

      const currentPred = await this.model.predict(candidate);
      if (currentPred === targetLabel && proximityLoss < 0.1) {
        break;
      }
    }

    return {
      original: instance,
      counterfactual: candidate,
      changes: this.diffFeatures(instance, candidate),
      valid: (await this.model.predict(candidate)) === targetLabel,
    };
  }

  // Growing-spheres: model-agnostic, no gradient required
  async generateGrowingSpheres(instance, targetLabel, config = {}) {
    let radius = config.startRadius || 0.01;
    const growthRate = config.growthRate || 1.2;
    const maxRadius = config.maxRadius || 5.0;
    const samplesPerSphere = config.samplesPerSphere || 200;

    while (radius < maxRadius) {
      const candidates = this.sampleOnSphere(instance, radius, samplesPerSphere);

      const validCandidates = [];
      for (const c of candidates) {
        const pred = await this.model.predict(c);
        if (pred === targetLabel) validCandidates.push(c);
      }

      if (validCandidates.length > 0) {
        // Refine: shrink toward the boundary for the closest valid point
        const closest = validCandidates.reduce((best, c) =>
          this.distance(c, instance) < this.distance(best, instance) ? c : best
        );
        return this.refineBoundary(instance, closest, targetLabel);
      }

      radius *= growthRate;
    }

    return { found: false, reason: "No counterfactual found within max radius" };
  }

  sampleOnSphere(center, radius, numSamples) {
    const dim = center.length;
    const samples = [];

    for (let i = 0; i < numSamples; i++) {
      const direction = Array.from({ length: dim }, () => this.gaussianRandom());
      const norm = Math.sqrt(direction.reduce((s, v) => s + v * v, 0));
      const unitVector = direction.map((v) => v / norm);

      const point = center.map((c, idx) => {
        if (!this.mutableFeatures.includes(idx)) return c;
        return this.clipToRange(c + unitVector[idx] * radius, idx);
      });

      samples.push(point);
    }

    return samples;
  }

  async refineBoundary(original, foundCounterfactual, targetLabel, precision = 20) {
    let inside = original;
    let outside = foundCounterfactual;

    for (let i = 0; i < precision; i++) {
      const midpoint = inside.map((v, idx) => (v + outside[idx]) / 2);
      const pred = await this.model.predict(midpoint);

      if (pred === targetLabel) {
        outside = midpoint;
      } else {
        inside = midpoint;
      }
    }

    return {
      original,
      counterfactual: outside,
      changes: this.diffFeatures(original, outside),
      valid: true,
      distance: this.distance(original, outside),
    };
  }

  // Diverse Counterfactual Explanations (DiCE-style)
  async generateDiverse(instance, targetLabel) {
    const counterfactuals = [];

    for (let i = 0; i < this.numDiverse; i++) {
      const diversityPenalty = counterfactuals.length > 0
        ? (candidate) => this.diversityLoss(candidate, counterfactuals)
        : () => 0;

      const cf = await this.generateWithDiversityPenalty(
        instance,
        targetLabel,
        diversityPenalty
      );

      counterfactuals.push(cf.counterfactual);
    }

    return counterfactuals.map((cf) => ({
      counterfactual: cf,
      changes: this.diffFeatures(instance, cf),
    }));
  }

  async generateWithDiversityPenalty(instance, targetLabel, diversityFn) {
    let candidate = [...instance];
    const learningRate = 0.05;

    for (let iter = 0; iter < 300; iter++) {
      const gradient = await this.estimateGradient(candidate, targetLabel);
      const diversityGrad = diversityFn(candidate);

      for (const idx of this.mutableFeatures) {
        candidate[idx] -= learningRate * (gradient[idx] - 0.3 * diversityGrad);
        candidate[idx] = this.clipToRange(candidate[idx], idx);
      }
    }

    return { counterfactual: candidate };
  }

  diversityLoss(candidate, existing) {
    // Encourage distance from previously found counterfactuals
    return existing.reduce((sum, cf) => sum + 1 / (this.distance(candidate, cf) + 1e-3), 0);
  }

  async estimateGradient(point, targetLabel, epsilon = 1e-3) {
    const gradient = new Array(point.length).fill(0);

    for (const idx of this.mutableFeatures) {
      const plus = [...point];
      const minus = [...point];
      plus[idx] += epsilon;
      minus[idx] -= epsilon;

      const predPlus = await this.model.predictProba(plus);
      const predMinus = await this.model.predictProba(minus);

      gradient[idx] =
        (this.crossEntropy(predPlus, targetLabel) - this.crossEntropy(predMinus, targetLabel)) /
        (2 * epsilon);
    }

    return gradient;
  }

  clipToRange(value, featureIdx) {
    const range = this.featureRanges[featureIdx];
    if (!range) return value;
    return Math.min(range.max, Math.max(range.min, value));
  }

  diffFeatures(original, counterfactual) {
    return original
      .map((v, idx) => ({ featureIndex: idx, from: v, to: counterfactual[idx] }))
      .filter((d) => Math.abs(d.from - d.to) > 1e-6);
  }

  weightedL1(a, b) {
    return a.reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0);
  }

  distance(a, b) {
    return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
  }

  crossEntropy(probs, targetLabel) {
    const p = Math.max(probs[targetLabel], 1e-9);
    return -Math.log(p);
  }

  gaussianRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}`,
  },

  {
    id: "saliency-gradcam",
    category: "Vision & Text",
    title: "Saliency Maps & Grad-CAM for Deep Models",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Visualize which input regions drive a neural network's prediction using gradient-based saliency and class activation mapping.",
    tags: ["saliency", "grad-cam", "deep-learning"],
    steps: [
      { label: "Forward Pass", icon: "➡️", detail: "Run input through the network and cache activations." },
      { label: "Backward Pass", icon: "⬅️", detail: "Compute gradients of target class score w.r.t. input or feature maps." },
      { label: "Aggregate Gradients", icon: "🧮", detail: "Pool gradients across channels to weight feature map importance." },
      { label: "Generate Heatmap", icon: "🔥", detail: "Combine weighted feature maps into a localization heatmap." },
      { label: "Upsample & Overlay", icon: "🖼️", detail: "Resize heatmap to input resolution and overlay on the image." },
      { label: "Sanity Check", icon: "🧪", detail: "Run randomization tests to confirm the map is model-dependent." },
    ],
    code: `class SaliencyExplainer {
  constructor(model) {
    this.model = model;
  }

  // Vanilla gradient saliency: dOutput/dInput
  async vanillaGradient(input, targetClass) {
    const gradient = await this.model.gradientOfOutput(input, targetClass);
    return this.normalize(this.absoluteValue(gradient));
  }

  // SmoothGrad: average gradients over noisy copies to reduce visual noise
  async smoothGrad(input, targetClass, config = {}) {
    const numSamples = config.numSamples || 50;
    const noiseLevel = config.noiseLevel || 0.15;

    const gradients = [];
    for (let i = 0; i < numSamples; i++) {
      const noised = this.addGaussianNoise(input, noiseLevel);
      const grad = await this.model.gradientOfOutput(noised, targetClass);
      gradients.push(grad);
    }

    const averaged = this.averageGradients(gradients);
    return this.normalize(this.absoluteValue(averaged));
  }

  // Integrated Gradients: accumulate gradients along a path from baseline to input
  async integratedGradients(input, targetClass, config = {}) {
    const steps = config.steps || 50;
    const baseline = config.baseline || this.zeroBaseline(input);

    const scaledInputs = Array.from({ length: steps + 1 }, (_, i) =>
      this.interpolate(baseline, input, i / steps)
    );

    const gradients = await Promise.all(
      scaledInputs.map((x) => this.model.gradientOfOutput(x, targetClass))
    );

    const avgGradient = this.averageGradients(gradients);
    const inputDiff = this.subtract(input, baseline);

    const integratedGrad = this.elementwiseMultiply(avgGradient, inputDiff);
    return this.normalize(this.absoluteValue(integratedGrad));
  }

  // Grad-CAM: class-discriminative localization from a conv layer
  async gradCAM(input, targetClass, layerName = "last_conv") {
    const { activations, gradients } = await this.model.forwardBackward(
      input,
      targetClass,
      layerName
    );

    // Global average pool the gradients to get per-channel importance weights
    const channelWeights = this.globalAveragePool(gradients);

    // Weighted combination of activation maps
    const heatmap = this.weightedSum(activations, channelWeights);

    // ReLU: only positive influence on the target class
    const relued = this.relu(heatmap);

    return this.normalize(this.upsample(relued, input.shape));
  }

  // Grad-CAM++: improved weighting for multiple instances of the same class
  async gradCAMPlusPlus(input, targetClass, layerName = "last_conv") {
    const { activations, gradients, secondOrderGrads, thirdOrderGrads } =
      await this.model.forwardBackwardHigherOrder(input, targetClass, layerName);

    const alphaWeights = this.computeAlphaWeights(
      gradients,
      secondOrderGrads,
      thirdOrderGrads,
      activations
    );

    const channelWeights = this.sumOverSpatial(
      this.elementwiseMultiply(alphaWeights, this.relu(gradients))
    );

    const heatmap = this.weightedSum(activations, channelWeights);
    return this.normalize(this.upsample(this.relu(heatmap), input.shape));
  }

  computeAlphaWeights(grad1, grad2, grad3, activations) {
    // alpha_k^ij = grad2 / (2*grad2 + sum_a,b(activations * grad3))
    const sumTerm = this.sumOverSpatial(this.elementwiseMultiply(activations, grad3));
    const denominator = this.add(
      this.scalarMultiply(grad2, 2),
      this.broadcastMultiply(sumTerm, grad2)
    );
    return this.elementwiseDivide(grad2, this.addEpsilon(denominator));
  }

  // Sanity check: model parameter randomization test (Adebayo et al.)
  async sanityCheck(input, targetClass, explainFn) {
    const originalMap = await explainFn(input, targetClass);

    const randomizedModel = this.model.withRandomizedWeights();
    const randomMap = await randomizedModel.explainWith(explainFn, input, targetClass);

    const similarity = this.structuralSimilarity(originalMap, randomMap);

    return {
      passesCheck: similarity < 0.5, // maps should differ substantially
      similarity,
      warning:
        similarity >= 0.5
          ? "Saliency map barely changes with randomized weights — may not reflect learned features"
          : null,
    };
  }

  // Helper numeric utilities
  absoluteValue(tensor) {
    return tensor.map((v) => Math.abs(v));
  }

  normalize(tensor) {
    const max = Math.max(...tensor.flat(Infinity));
    const min = Math.min(...tensor.flat(Infinity));
    return tensor.map((v) => (v - min) / (max - min + 1e-9));
  }

  relu(tensor) {
    return tensor.map((v) => Math.max(0, v));
  }

  addGaussianNoise(input, stdDev) {
    return input.map((v) => v + this.gaussian(0, stdDev));
  }

  gaussian(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  averageGradients(gradientList) {
    const shape = gradientList[0].length;
    const summed = new Array(shape).fill(0);
    for (const grad of gradientList) {
      for (let i = 0; i < shape; i++) summed[i] += grad[i];
    }
    return summed.map((v) => v / gradientList.length);
  }

  interpolate(baseline, input, alpha) {
    return baseline.map((b, i) => b + alpha * (input[i] - b));
  }

  zeroBaseline(input) {
    return input.map(() => 0);
  }

  subtract(a, b) {
    return a.map((v, i) => v - b[i]);
  }

  elementwiseMultiply(a, b) {
    return a.map((v, i) => v * b[i]);
  }

  globalAveragePool(gradients) {
    // Average over spatial dims per channel
    return gradients.map((channel) =>
      channel.flat().reduce((s, v) => s + v, 0) / channel.flat().length
    );
  }

  weightedSum(activations, weights) {
    return activations[0].map((_, spatialIdx) =>
      activations.reduce((sum, channel, c) => sum + channel[spatialIdx] * weights[c], 0)
    );
  }

  upsample(heatmap, targetShape) {
    // Bilinear-style nearest-neighbor upsample placeholder
    return heatmap; // actual implementation resizes to targetShape
  }
}`,
  },

  {
    id: "concept-activation-vectors",
    category: "Vision & Text",
    title: "Concept-Based Explanations (TCAV)",
    difficulty: "Advanced",
    time: "~35 min",
    description:
      "Test whether human-understandable concepts (e.g., 'stripes', 'medical terminology') influence a model's predictions, beyond raw pixels or tokens.",
    tags: ["tcav", "concepts", "interpretability"],
    steps: [
      { label: "Define Concept Set", icon: "💡", detail: "Gather positive examples embodying the concept and random negatives." },
      { label: "Extract Activations", icon: "🧠", detail: "Run examples through the model and collect layer activations." },
      { label: "Train Concept Classifier", icon: "📐", detail: "Fit a linear classifier separating concept vs non-concept activations." },
      { label: "Compute CAV", icon: "➡️", detail: "Use the classifier's normal vector as the Concept Activation Vector." },
      { label: "Measure Sensitivity", icon: "📊", detail: "Compute directional derivative of predictions along the CAV." },
      { label: "Test Significance", icon: "🧪", detail: "Run against random concepts to confirm the effect isn't noise." },
    ],
    code: `class TCAVExplainer {
  constructor(model, layerName) {
    this.model = model;
    this.layerName = layerName;
  }

  // Step 1-3: Train a Concept Activation Vector for a given concept
  async trainCAV(conceptExamples, randomExamples) {
    const conceptActivations = await this.getActivations(conceptExamples);
    const randomActivations = await this.getActivations(randomExamples);

    const X = [...conceptActivations, ...randomActivations];
    const y = [
      ...conceptActivations.map(() => 1),
      ...randomActivations.map(() => 0),
    ];

    const classifier = this.trainLinearClassifier(X, y);

    return {
      vector: this.normalize(classifier.weights),
      bias: classifier.bias,
      trainAccuracy: this.evaluateAccuracy(classifier, X, y),
    };
  }

  async getActivations(examples) {
    const activations = [];
    for (const example of examples) {
      const act = await this.model.getLayerActivation(example, this.layerName);
      activations.push(act.flat());
    }
    return activations;
  }

  trainLinearClassifier(X, y, epochs = 200, lr = 0.01) {
    const dim = X[0].length;
    let weights = new Array(dim).fill(0);
    let bias = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const pred = this.sigmoid(this.dot(weights, X[i]) + bias);
        const error = y[i] - pred;

        for (let j = 0; j < dim; j++) {
          weights[j] += lr * error * X[i][j];
        }
        bias += lr * error;
      }
    }

    return { weights, bias };
  }

  // Step 4-5: TCAV score - fraction of inputs where the concept
  // positively influences the target class prediction
  async computeTCAVScore(cav, targetClass, testExamples) {
    let positiveCount = 0;

    for (const example of testExamples) {
      const sensitivity = await this.directionalDerivative(example, cav, targetClass);
      if (sensitivity > 0) positiveCount++;
    }

    return {
      tcavScore: positiveCount / testExamples.length,
      numExamples: testExamples.length,
      concept: cav.name,
      targetClass,
    };
  }

  async directionalDerivative(example, cav, targetClass) {
    // S_C,k,l(x) = grad(h_l,k(f_l(x))) . v_C
    const gradient = await this.model.gradientAtLayer(
      example,
      this.layerName,
      targetClass
    );

    return this.dot(gradient.flat(), cav.vector);
  }

  // Step 6: statistical significance test against random "concepts"
  async testSignificance(realCAV, targetClass, testExamples, numRandomTrials = 20) {
    const realScore = await this.computeTCAVScore(realCAV, targetClass, testExamples);

    const randomScores = [];
    for (let trial = 0; trial < numRandomTrials; trial++) {
      const randomConceptA = this.sampleRandomExamples(50);
      const randomConceptB = this.sampleRandomExamples(50);
      const randomCAV = await this.trainCAV(randomConceptA, randomConceptB);
      const score = await this.computeTCAVScore(randomCAV, targetClass, testExamples);
      randomScores.push(score.tcavScore);
    }

    const mean = randomScores.reduce((a, b) => a + b, 0) / randomScores.length;
    const stddev = Math.sqrt(
      randomScores.reduce((s, v) => s + (v - mean) ** 2, 0) / randomScores.length
    );

    const tStatistic = (realScore.tcavScore - mean) / (stddev / Math.sqrt(numRandomTrials) + 1e-9);

    return {
      realScore: realScore.tcavScore,
      randomBaselineMean: mean,
      randomBaselineStd: stddev,
      tStatistic,
      significant: Math.abs(tStatistic) > 2.0, // approx p < 0.05
    };
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  dot(a, b) {
    return a.reduce((sum, v, i) => sum + v * b[i], 0);
  }

  normalize(vector) {
    const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
    return vector.map((v) => v / (norm + 1e-9));
  }

  evaluateAccuracy(classifier, X, y) {
    let correct = 0;
    for (let i = 0; i < X.length; i++) {
      const pred = this.sigmoid(this.dot(classifier.weights, X[i]) + classifier.bias) > 0.5 ? 1 : 0;
      if (pred === y[i]) correct++;
    }
    return correct / X.length;
  }

  sampleRandomExamples(count) {
    // In practice, sample from a large unrelated image/text pool
    return Array.from({ length: count }, () => this.model.sampleRandomInput());
  }
}`,
  },

  {
    id: "global-surrogates",
    category: "Global Explanation",
    title: "Global Surrogate Models & Rule Extraction",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Approximate a complex black-box model with an interpretable global surrogate, such as a shallow tree or rule list.",
    tags: ["surrogate", "distillation", "rule-extraction"],
    steps: [
      { label: "Sample Input Space", icon: "🎲", detail: "Generate a broad, representative set of inputs across the feature space." },
      { label: "Query Black Box", icon: "❓", detail: "Get predictions from the original model for every sampled input." },
      { label: "Fit Interpretable Model", icon: "🌳", detail: "Train a shallow tree, rule list, or linear model on (input, prediction) pairs." },
      { label: "Measure Fidelity", icon: "📏", detail: "Check how well the surrogate matches the black box's decisions." },
      { label: "Extract Rules", icon: "📜", detail: "Convert tree paths into human-readable if-then rules." },
      { label: "Report Coverage", icon: "📊", detail: "Note where the surrogate is faithful and where it diverges." },
    ],
    code: `class GlobalSurrogateExplainer {
  constructor(blackBoxModel, config = {}) {
    this.blackBox = blackBoxModel;
    this.maxDepth = config.maxDepth || 4;
    this.numSamples = config.numSamples || 5000;
  }

  // Distill the black box into a shallow, interpretable decision tree
  async distillToTree(featureRanges, featureNames) {
    const syntheticInputs = this.sampleInputSpace(featureRanges, this.numSamples);
    const labels = await Promise.all(
      syntheticInputs.map((x) => this.blackBox.predict(x))
    );

    const tree = this.buildTree(syntheticInputs, labels, featureNames, 0);

    const fidelity = await this.measureFidelity(tree, syntheticInputs, labels);

    return { tree, fidelity, sampleSize: syntheticInputs.length };
  }

  sampleInputSpace(ranges, numSamples) {
    return Array.from({ length: numSamples }, () =>
      ranges.map((r) => r.min + Math.random() * (r.max - r.min))
    );
  }

  buildTree(X, y, featureNames, depth) {
    if (depth >= this.maxDepth || this.isPure(y) || X.length < 20) {
      return { isLeaf: true, prediction: this.majorityClass(y), support: X.length };
    }

    const bestSplit = this.findBestSplit(X, y);
    if (!bestSplit) {
      return { isLeaf: true, prediction: this.majorityClass(y), support: X.length };
    }

    const { featureIndex, threshold, leftIdx, rightIdx } = bestSplit;

    const leftX = leftIdx.map((i) => X[i]);
    const leftY = leftIdx.map((i) => y[i]);
    const rightX = rightIdx.map((i) => X[i]);
    const rightY = rightIdx.map((i) => y[i]);

    return {
      isLeaf: false,
      featureIndex,
      featureName: featureNames ? featureNames[featureIndex] : \`feature_\${featureIndex}\`,
      threshold,
      left: this.buildTree(leftX, leftY, featureNames, depth + 1),
      right: this.buildTree(rightX, rightY, featureNames, depth + 1),
      support: X.length,
    };
  }

  findBestSplit(X, y) {
    let best = null;
    let bestGini = Infinity;
    const numFeatures = X[0].length;

    for (let f = 0; f < numFeatures; f++) {
      const values = [...new Set(X.map((row) => row[f]))].sort((a, b) => a - b);

      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const leftIdx = [];
        const rightIdx = [];

        X.forEach((row, idx) => {
          if (row[f] <= threshold) leftIdx.push(idx);
          else rightIdx.push(idx);
        });

        if (leftIdx.length === 0 || rightIdx.length === 0) continue;

        const gini = this.weightedGini(
          leftIdx.map((idx) => y[idx]),
          rightIdx.map((idx) => y[idx])
        );

        if (gini < bestGini) {
          bestGini = gini;
          best = { featureIndex: f, threshold, leftIdx, rightIdx };
        }
      }
    }

    return best;
  }

  weightedGini(leftY, rightY) {
    const total = leftY.length + rightY.length;
    return (
      (leftY.length / total) * this.gini(leftY) +
      (rightY.length / total) * this.gini(rightY)
    );
  }

  gini(labels) {
    const counts = {};
    labels.forEach((l) => (counts[l] = (counts[l] || 0) + 1));
    const total = labels.length;
    return 1 - Object.values(counts).reduce((sum, c) => sum + (c / total) ** 2, 0);
  }

  isPure(labels) {
    return new Set(labels).size === 1;
  }

  majorityClass(labels) {
    const counts = {};
    labels.forEach((l) => (counts[l] = (counts[l] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  async measureFidelity(tree, X, blackBoxLabels) {
    let agree = 0;
    for (let i = 0; i < X.length; i++) {
      const surrogatePred = this.predictWithTree(tree, X[i]);
      if (String(surrogatePred) === String(blackBoxLabels[i])) agree++;
    }
    return agree / X.length;
  }

  predictWithTree(node, input) {
    if (node.isLeaf) return node.prediction;
    return input[node.featureIndex] <= node.threshold
      ? this.predictWithTree(node.left, input)
      : this.predictWithTree(node.right, input);
  }

  // Convert tree paths into readable if-then rules
  extractRules(node, path = []) {
    if (node.isLeaf) {
      return [{
        conditions: [...path],
        prediction: node.prediction,
        support: node.support,
      }];
    }

    const leftPath = [...path, \`\${node.featureName} <= \${node.threshold.toFixed(3)}\`];
    const rightPath = [...path, \`\${node.featureName} > \${node.threshold.toFixed(3)}\`];

    return [
      ...this.extractRules(node.left, leftPath),
      ...this.extractRules(node.right, rightPath),
    ];
  }
}`,
  },

  {
    id: "model-cards",
    category: "Governance",
    title: "Model Cards & Explanation Reporting",
    difficulty: "Beginner",
    time: "~20 min",
    description:
      "Document model behavior, limitations, and explanation results in a standardized, stakeholder-readable model card.",
    tags: ["model-cards", "documentation", "governance"],
    steps: [
      { label: "Describe Intended Use", icon: "🎯", detail: "State the model's purpose and out-of-scope use cases." },
      { label: "Summarize Training Data", icon: "📊", detail: "Document data sources, size, and known gaps." },
      { label: "Report Performance", icon: "📈", detail: "List metrics broken down by relevant subgroups." },
      { label: "Attach Explanations", icon: "🔍", detail: "Include global feature importance and example local explanations." },
      { label: "Disclose Limitations", icon: "⚠️", detail: "Note known failure modes and ethical considerations." },
      { label: "Version & Publish", icon: "📦", detail: "Attach a version, date, and owner for traceability." },
    ],
    code: `class ModelCardBuilder {
  constructor(modelName, version) {
    this.card = {
      modelName,
      version,
      createdAt: new Date(),
      sections: {},
    };
  }

  setIntendedUse(details) {
    this.card.sections.intendedUse = {
      primaryUses: details.primaryUses,
      primaryUsers: details.primaryUsers,
      outOfScopeUses: details.outOfScopeUses,
    };
    return this;
  }

  setTrainingData(details) {
    this.card.sections.trainingData = {
      sources: details.sources,
      size: details.size,
      timeRange: details.timeRange,
      knownGaps: details.knownGaps || [],
      preprocessing: details.preprocessing,
    };
    return this;
  }

  setPerformanceMetrics(metricsBySubgroup) {
    const overall = this.aggregateMetrics(metricsBySubgroup);
    const disparities = this.computeSubgroupDisparities(metricsBySubgroup);

    this.card.sections.performance = {
      overall,
      bySubgroup: metricsBySubgroup,
      disparities,
      flaggedForReview: disparities.some((d) => d.gap > 0.1),
    };
    return this;
  }

  computeSubgroupDisparities(metricsBySubgroup) {
    const groups = Object.entries(metricsBySubgroup);
    const disparities = [];

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const [nameA, metricsA] = groups[i];
        const [nameB, metricsB] = groups[j];

        const gap = Math.abs(metricsA.accuracy - metricsB.accuracy);
        disparities.push({ groupA: nameA, groupB: nameB, metric: "accuracy", gap });
      }
    }

    return disparities;
  }

  aggregateMetrics(metricsBySubgroup) {
    const groups = Object.values(metricsBySubgroup);
    const keys = Object.keys(groups[0]);

    const aggregated = {};
    for (const key of keys) {
      aggregated[key] = groups.reduce((sum, g) => sum + g[key], 0) / groups.length;
    }
    return aggregated;
  }

  attachExplanations(globalImportance, sampleLocalExplanations) {
    this.card.sections.explainability = {
      method: globalImportance.method || "SHAP",
      globalFeatureImportance: globalImportance.ranking.slice(0, 10),
      sampleLocalExplanations: sampleLocalExplanations.map((ex) => ({
        instanceId: ex.id,
        prediction: ex.prediction,
        topContributingFeatures: ex.topFeatures,
      })),
      faithfulnessScore: globalImportance.faithfulnessScore,
    };
    return this;
  }

  setLimitations(details) {
    this.card.sections.limitations = {
      knownFailureModes: details.knownFailureModes,
      ethicalConsiderations: details.ethicalConsiderations,
      recommendedMitigations: details.recommendedMitigations,
    };
    return this;
  }

  setOwnership(details) {
    this.card.sections.ownership = {
      owner: details.owner,
      contact: details.contact,
      reviewCadence: details.reviewCadence,
      lastReviewed: details.lastReviewed || new Date(),
    };
    return this;
  }

  validate() {
    const requiredSections = [
      "intendedUse",
      "trainingData",
      "performance",
      "explainability",
      "limitations",
    ];

    const missing = requiredSections.filter((s) => !this.card.sections[s]);

    return {
      complete: missing.length === 0,
      missingSections: missing,
    };
  }

  build() {
    const validation = this.validate();
    if (!validation.complete) {
      console.warn(\`Model card missing sections: \${validation.missingSections.join(", ")}\`);
    }
    return this.card;
  }

  toMarkdown() {
    const c = this.card;
    let md = \`# Model Card: \${c.modelName} (v\${c.version})\n\n\`;

    if (c.sections.intendedUse) {
      md += \`## Intended Use\n\${c.sections.intendedUse.primaryUses.join(", ")}\n\n\`;
    }
    if (c.sections.performance) {
      md += \`## Performance\nOverall accuracy: \${(c.sections.performance.overall.accuracy * 100).toFixed(1)}%\n\n\`;
    }
    if (c.sections.explainability) {
      md += \`## Top Features\n\${c.sections.explainability.globalFeatureImportance
        .map((f, i) => \`\${i + 1}. \${f.feature}\`)
        .join("\n")}\n\n\`;
    }
    if (c.sections.limitations) {
      md += \`## Limitations\n\${c.sections.limitations.knownFailureModes.join("\n")}\n\`;
    }

    return md;
  }
}`,
  },

  {
    id: "explanation-evaluation",
    category: "Governance",
    title: "Evaluating Explanation Quality",
    difficulty: "Advanced",
    time: "~35 min",
    description:
      "Measure whether explanations are faithful, stable, and useful, rather than assuming plausibility equals correctness.",
    tags: ["evaluation", "faithfulness", "stability"],
    steps: [
      { label: "Test Faithfulness", icon: "🎯", detail: "Remove top-attributed features and measure prediction change." },
      { label: "Test Stability", icon: "📏", detail: "Perturb inputs slightly and check explanation consistency." },
      { label: "Test Completeness", icon: "🧩", detail: "Verify attributions sum to the model's actual output difference." },
      { label: "Run Sanity Checks", icon: "🧪", detail: "Randomize model weights or labels; explanation should change." },
      { label: "Assess Human Utility", icon: "👥", detail: "Measure whether explanations improve human decision accuracy." },
      { label: "Compare Methods", icon: "⚖️", detail: "Benchmark multiple explanation methods against the same criteria." },
    ],
    code: `class ExplanationEvaluator {
  constructor(model) {
    this.model = model;
  }

  // Faithfulness via deletion: remove top-k features, measure prediction drop
  async evaluateFaithfulness(instance, explanation, config = {}) {
    const topK = config.topK || 5;
    const sortedFeatures = [...explanation]
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, topK);

    const originalPrediction = await this.model.predictProba(instance);
    const originalConfidence = Math.max(...originalPrediction);

    let modifiedInstance = [...instance];
    const deletionCurve = [{ numRemoved: 0, confidence: originalConfidence }];

    for (let i = 0; i < sortedFeatures.length; i++) {
      modifiedInstance[sortedFeatures[i].featureIndex] = this.baselineValue(
        sortedFeatures[i].featureIndex
      );

      const newPrediction = await this.model.predictProba(modifiedInstance);
      deletionCurve.push({
        numRemoved: i + 1,
        confidence: Math.max(...newPrediction),
      });
    }

    const areaUnderCurve = this.trapezoidalArea(deletionCurve);

    return {
      deletionCurve,
      areaUnderCurve,
      faithful: areaUnderCurve < 0.5 * originalConfidence * sortedFeatures.length,
    };
  }

  // Stability: similar inputs should yield similar explanations
  async evaluateStability(instance, explainFn, config = {}) {
    const numPerturbations = config.numPerturbations || 20;
    const noiseLevel = config.noiseLevel || 0.02;

    const originalExplanation = await explainFn(instance);
    const distances = [];

    for (let i = 0; i < numPerturbations; i++) {
      const perturbed = instance.map((v) => v + this.gaussian(0, noiseLevel));
      const perturbedExplanation = await explainFn(perturbed);

      const dist = this.explanationDistance(originalExplanation, perturbedExplanation);
      distances.push(dist);
    }

    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const maxDistance = Math.max(...distances);

    return {
      meanDistance,
      maxDistance,
      stable: maxDistance < 0.3, // threshold depends on normalization
    };
  }

  // Completeness: SHAP-style attributions should sum to prediction difference
  async evaluateCompleteness(instance, baseline, explanation) {
    const predictionAtInstance = await this.model.predict(instance);
    const predictionAtBaseline = await this.model.predict(baseline);
    const actualDifference = predictionAtInstance - predictionAtBaseline;

    const summedAttribution = explanation.reduce((sum, e) => sum + e.weight, 0);
    const gap = Math.abs(actualDifference - summedAttribution);

    return {
      actualDifference,
      summedAttribution,
      gap,
      complete: gap < 0.05 * Math.abs(actualDifference || 1),
    };
  }

  // Sanity check: explanation should change when model weights are randomized
  async modelParameterRandomizationTest(instance, explainFn) {
    const originalExplanation = await explainFn(instance, this.model);

    const randomizedModel = this.model.withRandomizedWeights();
    const randomExplanation = await explainFn(instance, randomizedModel);

    const similarity = this.explanationSimilarity(originalExplanation, randomExplanation);

    return {
      similarity,
      passes: similarity < 0.5,
      interpretation:
        similarity >= 0.5
          ? "Explanation is largely unaffected by model weights — suspect edge/input-only artifact"
          : "Explanation is sensitive to learned weights, as expected",
    };
  }

  // Human utility: does the explanation help humans predict model behavior?
  evaluateForwardSimulation(humanPredictions, modelPredictions) {
    let agree = 0;
    for (let i = 0; i < humanPredictions.length; i++) {
      if (humanPredictions[i] === modelPredictions[i]) agree++;
    }

    return {
      simulatability: agree / humanPredictions.length,
      interpretation:
        "Fraction of cases where a human, given only the explanation, correctly predicted the model's output",
    };
  }

  baselineValue(featureIndex) {
    return 0; // could be feature mean, median, or domain-specific default
  }

  trapezoidalArea(curve) {
    let area = 0;
    for (let i = 0; i < curve.length - 1; i++) {
      const h = curve[i + 1].numRemoved - curve[i].numRemoved;
      area += (h * (curve[i].confidence + curve[i + 1].confidence)) / 2;
    }
    return area;
  }

  explanationDistance(expA, expB) {
    const vecA = expA.map((e) => e.weight);
    const vecB = expB.map((e) => e.weight);
    return Math.sqrt(vecA.reduce((sum, v, i) => sum + (v - vecB[i]) ** 2, 0));
  }

  explanationSimilarity(expA, expB) {
    const vecA = expA.map((e) => e.weight);
    const vecB = expB.map((e) => e.weight);
    const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0));
    const normB = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0));
    return dot / (normA * normB + 1e-9);
  }

  gaussian(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}`,
  },

  {
    id: "fairness-explanations",
    category: "Governance",
    title: "Fairness-Aware Explanations",
    difficulty: "Advanced",
    time: "~35 min",
    description:
      "Use explanation techniques to audit models for proxy discrimination and unequal treatment across protected groups.",
    tags: ["fairness", "bias-audit", "protected-attributes"],
    steps: [
      { label: "Define Protected Groups", icon: "👥", detail: "Identify sensitive attributes requiring fairness scrutiny." },
      { label: "Compute Group Attributions", icon: "📊", detail: "Run attribution methods separately per subgroup." },
      { label: "Detect Proxy Features", icon: "🔍", detail: "Check if non-protected features correlate with protected ones." },
      { label: "Compare Explanation Patterns", icon: "⚖️", detail: "See if the model relies on different logic per group." },
      { label: "Quantify Disparate Reliance", icon: "📈", detail: "Measure how much each group's outcome depends on proxies." },
      { label: "Recommend Mitigation", icon: "🛠️", detail: "Suggest feature removal, reweighing, or constraint-based fixes." },
    ],
    code: `class FairnessExplainer {
  constructor(model, explainer, protectedAttributeIndex) {
    this.model = model;
    this.explainer = explainer; // any local explainer (SHAP/LIME) instance
    this.protectedIndex = protectedAttributeIndex;
  }

  async auditProxyFeatures(dataset, featureNames) {
    const protectedValues = dataset.map((row) => row[this.protectedIndex]);
    const proxyScores = [];

    for (let f = 0; f < dataset[0].length; f++) {
      if (f === this.protectedIndex) continue;

      const featureValues = dataset.map((row) => row[f]);
      const correlation = this.pointBiserialCorrelation(featureValues, protectedValues);

      proxyScores.push({
        feature: featureNames ? featureNames[f] : \`feature_\${f}\`,
        featureIndex: f,
        correlationWithProtected: correlation,
        isPotentialProxy: Math.abs(correlation) > 0.5,
      });
    }

    return proxyScores.sort(
      (a, b) => Math.abs(b.correlationWithProtected) - Math.abs(a.correlationWithProtected)
    );
  }

  async compareGroupAttributions(dataset, featureNames) {
    const groups = this.splitByProtectedAttribute(dataset);
    const groupExplanations = {};

    for (const [groupValue, instances] of Object.entries(groups)) {
      const explanations = await Promise.all(
        instances.slice(0, 100).map((inst) => this.explainer.explain(inst))
      );

      groupExplanations[groupValue] = this.averageAttributions(explanations, featureNames);
    }

    const divergence = this.compareDistributions(groupExplanations);

    return {
      groupExplanations,
      divergence,
      flaggedFeatures: divergence.filter((d) => d.gap > 0.15),
    };
  }

  splitByProtectedAttribute(dataset) {
    const groups = {};
    for (const row of dataset) {
      const key = String(row[this.protectedIndex]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    }
    return groups;
  }

  averageAttributions(explanations, featureNames) {
    const numFeatures = explanations[0].shapValues
      ? explanations[0].shapValues.length
      : explanations[0].length;

    const totals = new Array(numFeatures).fill(0);
    for (const exp of explanations) {
      const values = exp.shapValues || exp;
      values.forEach((v, i) => (totals[i] += Math.abs(v)));
    }

    return totals.map((t, i) => ({
      feature: featureNames ? featureNames[i] : \`feature_\${i}\`,
      meanAbsAttribution: t / explanations.length,
    }));
  }

  compareDistributions(groupExplanations) {
    const groupKeys = Object.keys(groupExplanations);
    if (groupKeys.length < 2) return [];

    const [groupA, groupB] = groupKeys;
    const attrsA = groupExplanations[groupA];
    const attrsB = groupExplanations[groupB];

    return attrsA.map((attrA, i) => ({
      feature: attrA.feature,
      groupAValue: attrA.meanAbsAttribution,
      groupBValue: attrsB[i].meanAbsAttribution,
      gap: Math.abs(attrA.meanAbsAttribution - attrsB[i].meanAbsAttribution),
    }));
  }

  // Quantify how much a group's predictions depend on proxy features
  async quantifyProxyReliance(dataset, proxyFeatureIndices) {
    const results = {};

    for (const groupValue of new Set(dataset.map((r) => r[this.protectedIndex]))) {
      const groupData = dataset.filter((r) => r[this.protectedIndex] === groupValue);

      const withProxies = await this.averagePredictionConfidence(groupData);
      const proxiesRemoved = groupData.map((row) => {
        const modified = [...row];
        proxyFeatureIndices.forEach((idx) => (modified[idx] = 0));
        return modified;
      });
      const withoutProxies = await this.averagePredictionConfidence(proxiesRemoved);

      results[groupValue] = {
        confidenceWithProxies: withProxies,
        confidenceWithoutProxies: withoutProxies,
        relianceGap: Math.abs(withProxies - withoutProxies),
      };
    }

    return results;
  }

  async averagePredictionConfidence(instances) {
    const predictions = await Promise.all(
      instances.map((inst) => this.model.predictProba(inst))
    );
    const confidences = predictions.map((p) => Math.max(...p));
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  pointBiserialCorrelation(continuous, binary) {
    const uniqueVals = [...new Set(binary)];
    if (uniqueVals.length !== 2) return 0;

    const group1 = continuous.filter((_, i) => binary[i] === uniqueVals[0]);
    const group0 = continuous.filter((_, i) => binary[i] === uniqueVals[1]);

    const mean1 = group1.reduce((a, b) => a + b, 0) / group1.length;
    const mean0 = group0.reduce((a, b) => a + b, 0) / group0.length;

    const allMean = continuous.reduce((a, b) => a + b, 0) / continuous.length;
    const stddev = Math.sqrt(
      continuous.reduce((s, v) => s + (v - allMean) ** 2, 0) / continuous.length
    );

    const p = group1.length / continuous.length;
    const q = 1 - p;

    return ((mean1 - mean0) / (stddev + 1e-9)) * Math.sqrt(p * q);
  }
}`,
  },

  {
    id: "attention-interpretation",
    category: "Vision & Text",
    title: "Interpreting Attention in Transformers",
    difficulty: "Advanced",
    time: "~35 min",
    description:
      "Extract, visualize, and critically evaluate attention weights in transformer models as (contested) evidence of importance.",
    tags: ["attention", "transformers", "nlp"],
    steps: [
      { label: "Extract Attention Weights", icon: "🧠", detail: "Pull per-head, per-layer attention matrices from a forward pass." },
      { label: "Aggregate Across Heads", icon: "🔀", detail: "Average or max-pool attention across heads within a layer." },
      { label: "Compute Attention Rollout", icon: "🌀", detail: "Propagate attention through layers accounting for residual connections." },
      { label: "Visualize Token Relations", icon: "🖼️", detail: "Render attention as a heatmap or graph over input tokens." },
      { label: "Cross-Check with Gradients", icon: "🔬", detail: "Compare attention patterns against gradient-based attribution." },
      { label: "Report Caveats", icon: "⚠️", detail: "Note that attention is not guaranteed to equal explanation." },
    ],
    code: `class AttentionInterpreter {
  constructor(model) {
    this.model = model;
  }

  async extractAttention(inputTokens) {
    // Returns attention[layer][head][fromToken][toToken]
    return this.model.getAttentionWeights(inputTokens);
  }

  // Simple aggregation: average attention across all heads in a layer
  averageHeadsInLayer(attention, layerIndex) {
    const layerAttention = attention[layerIndex];
    const numHeads = layerAttention.length;
    const seqLen = layerAttention[0].length;

    const averaged = Array.from({ length: seqLen }, () => new Array(seqLen).fill(0));

    for (const headAttention of layerAttention) {
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < seqLen; j++) {
          averaged[i][j] += headAttention[i][j] / numHeads;
        }
      }
    }

    return averaged;
  }

  // Attention Rollout: recursively multiply attention matrices through
  // layers, accounting for residual connections (Abnar & Zuidema, 2020)
  computeAttentionRollout(attention) {
    const numLayers = attention.length;
    const seqLen = attention[0][0].length;

    let rollout = this.identityMatrix(seqLen);

    for (let layer = 0; layer < numLayers; layer++) {
      const layerAttn = this.averageHeadsInLayer(attention, layer);

      // Add residual connection: A_hat = 0.5*A + 0.5*I
      const withResidual = this.addResidual(layerAttn, 0.5);

      // Row-normalize
      const normalized = this.rowNormalize(withResidual);

      rollout = this.matrixMultiply(normalized, rollout);
    }

    return rollout;
  }

  // Attention Flow: treat attention as max-flow graph capacity (alternative to rollout)
  computeAttentionFlow(attention, sourceToken, targetToken) {
    const numLayers = attention.length;
    const seqLen = attention[0][0].length;

    // Build a layered graph where edges are weighted by attention
    const graph = this.buildLayeredGraph(attention, numLayers, seqLen);

    return this.maxFlow(graph, \`L0_\${sourceToken}\`, \`L\${numLayers}_\${targetToken}\`);
  }

  // Compare attention-derived importance with gradient-based attribution
  async crossValidateWithGradients(inputTokens, targetOutput) {
    const attention = await this.extractAttention(inputTokens);
    const rollout = this.computeAttentionRollout(attention);
    const attentionImportance = rollout[rollout.length - 1]; // attention to [CLS]/last token

    const gradients = await this.model.gradientOfOutput(inputTokens, targetOutput);
    const gradientImportance = gradients.map((g) => Math.abs(g));

    const correlation = this.spearmanCorrelation(attentionImportance, gradientImportance);

    return {
      attentionImportance,
      gradientImportance,
      rankCorrelation: correlation,
      agreement: correlation > 0.5 ? "moderate-to-strong" : "weak",
      caveat:
        "Low correlation doesn't necessarily mean attention is 'wrong' — " +
        "the two methods answer different questions about the model.",
    };
  }

  identityMatrix(n) {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
  }

  addResidual(matrix, residualWeight) {
    const n = matrix.length;
    return matrix.map((row, i) =>
      row.map((v, j) => residualWeight * v + (1 - residualWeight) * (i === j ? 1 : 0))
    );
  }

  rowNormalize(matrix) {
    return matrix.map((row) => {
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map((v) => v / (sum + 1e-9));
    });
  }

  matrixMultiply(A, B) {
    const n = A.length;
    const result = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  buildLayeredGraph(attention, numLayers, seqLen) {
    // Construct nodes L{layer}_{token} with edges weighted by attention
    const graph = {};
    for (let layer = 0; layer < numLayers; layer++) {
      const layerAttn = this.averageHeadsInLayer(attention, layer);
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < seqLen; j++) {
          const from = \`L\${layer}_\${j}\`;
          const to = \`L\${layer + 1}_\${i}\`;
          graph[from] = graph[from] || [];
          graph[from].push({ to, capacity: layerAttn[i][j] });
        }
      }
    }
    return graph;
  }

  maxFlow(graph, source, sink) {
    // Simplified capacity-scaling max-flow approximation
    let totalFlow = 0;
    const visited = new Set();

    const dfs = (node, minCapacity) => {
      if (node === sink) return minCapacity;
      visited.add(node);

      for (const edge of graph[node] || []) {
        if (!visited.has(edge.to) && edge.capacity > 0) {
          const flow = dfs(edge.to, Math.min(minCapacity, edge.capacity));
          if (flow > 0) {
            edge.capacity -= flow;
            return flow;
          }
        }
      }
      return 0;
    };

    let flow;
    do {
      visited.clear();
      flow = dfs(source, Infinity);
      totalFlow += flow;
    } while (flow > 0);

    return totalFlow;
  }

  spearmanCorrelation(a, b) {
    const rankA = this.rank(a);
    const rankB = this.rank(b);
    const n = a.length;
    const dSquaredSum = rankA.reduce((sum, r, i) => sum + (r - rankB[i]) ** 2, 0);
    return 1 - (6 * dSquaredSum) / (n * (n * n - 1));
  }

  rank(values) {
    const sorted = [...values].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(values.length);
    sorted.forEach((item, rank) => (ranks[item.i] = rank + 1));
    return ranks;
  }
}`,
  },
];

const CATEGORIES = ["All", "Foundations", "Attribution", "Vision & Text", "Global Explanation", "Governance"];
const DIFFICULTIES = { Beginner: "#0F6E56", Intermediate: "#185FA5", Advanced: "#993C1D" };
const DIFFICULTY_BG = { Beginner: "#E1F5EE", Intermediate: "#E6F1FB", Advanced: "#FAECE7" };

function StepFlow({ steps }) {
  const [active, setActive] = useState(null);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setActive(active === i ? null : i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 20,
                border: active === i ? "1.5px solid #185FA5" : "0.5px solid var(--color-border-tertiary)",
                background: active === i ? "#E6F1FB" : "var(--color-background-primary)",
                color: active === i ? "#185FA5" : "var(--color-text-primary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active === i ? 500 : 400,
                transition: "all 0.15s",
              }}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </button>
            {i < steps.length - 1 && <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>→</span>}
          </div>
        ))}
      </div>

      {active !== null && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{steps[active].label}: </span>
          {steps[active].detail}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ position: "relative", marginTop: 16 }}>
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "4px 10px",
          borderRadius: 6,
          border: "0.5px solid var(--color-border-secondary)",
          background: "var(--color-background-secondary)",
          cursor: "pointer",
          fontSize: 12,
          color: "var(--color-text-secondary)",
          zIndex: 1,
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>

      <pre
        style={{
          margin: 0,
          padding: "14px 16px",
          borderRadius: 10,
          overflowX: "auto",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          fontSize: 12,
          lineHeight: 1.65,
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-primary)",
          whiteSpace: "pre",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RecipeCard({ recipe, onSelect, selected }) {
  return (
    <div
      onClick={() => onSelect(recipe)}
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        cursor: "pointer",
        border: selected ? "1.5px solid #185FA5" : "0.5px solid var(--color-border-tertiary)",
        background: selected ? "#061320" : "var(--color-background-primary)",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 400 }}>
          {recipe.category}
        </span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 20,
            fontWeight: 500,
            background: DIFFICULTY_BG[recipe.difficulty],
            color: DIFFICULTIES[recipe.difficulty],
          }}
        >
          {recipe.difficulty}
        </span>
      </div>
      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, color: "var(--color-text-primary)" }}>
        {recipe.title}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {recipe.description}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {recipe.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 20,
              background: "var(--color-background-tertiary)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecipeDetail({ recipe }) {
  const [tab, setTab] = useState("steps");

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: 14,
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{recipe.category}</span>
          <h2 style={{ margin: "4px 0 6px", fontSize: 22, fontWeight: 500 }}>{recipe.title}</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
          <span
            style={{
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 20,
              fontWeight: 500,
              background: DIFFICULTY_BG[recipe.difficulty],
              color: DIFFICULTIES[recipe.difficulty],
            }}
          >
            {recipe.difficulty}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>⏱ {recipe.time}</span>
        </div>
      </div>

      <p style={{ margin: "0 0 20px", color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
        {recipe.description}
      </p>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 18,
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          paddingBottom: 0,
        }}
      >
        {["steps", "code"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t ? "2px solid #185FA5" : "2px solid transparent",
              marginBottom: -1,
              transition: "all 0.12s",
            }}
          >
            {t === "steps" ? "Pipeline Steps" : "Code Example"}
          </button>
        ))}
      </div>

      {tab === "steps" && <StepFlow steps={recipe.steps} />}
      {tab === "code" && <CodeBlock code={recipe.code} />}
    </div>
  );
}

function Sidebar({ recipes, selected, onSelect, category, setCategory, search, setSearch }) {
  const filtered = recipes.filter((r) => {
    const matchCat = category === "All" || r.category === category;
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      <div style={{ padding: "0 0 16px" }}>
        <input
          type="text"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            fontSize: 13,
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              cursor: "pointer",
              border: category === c ? "1.5px solid #185FA5" : "0.5px solid var(--color-border-tertiary)",
              background: category === c ? "#E6F1FB" : "var(--color-background-primary)",
              color: category === c ? "#185FA5" : "var(--color-text-secondary)",
              fontWeight: category === c ? 500 : 400,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ color: "var(--color-text-tertiary)", fontSize: 13, padding: "12px 0" }}>
            No recipes found.
          </div>
        ) : (
          filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} onSelect={onSelect} selected={selected?.id === r.id} />
          ))
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        padding: "20px 32px 16px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#E1F5EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        🔍
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: "-0.3px" }}>Explainable AI Cookbook</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
          Attribution methods, counterfactuals, and interpretability best practices for AI systems
        </p>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
        {[
          { label: "Recipes", value: ExplainableAI.length },
          { label: "Categories", value: CATEGORIES.length - 1 },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(ExplainableAI[0]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        background: "var(--color-background-tertiary, radial-gradient(circle at top, #0f172a, #020617))",
        color: "var(--color-text-primary)",
      }}
    >
      <Header />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            width: 320,
            minWidth: 260,
            padding: "20px 20px",
            borderRight: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-primary)",
            overflowY: "auto",
          }}
        >
          <Sidebar
            recipes={ExplainableAI}
            selected={selected}
            onSelect={setSelected}
            category={category}
            setCategory={setCategory}
            search={search}
            setSearch={setSearch}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {selected ? (
            <RecipeDetail recipe={selected} />
          ) : (
            <div style={{ color: "var(--color-text-tertiary)", padding: 40, textAlign: "center" }}>
              Select a recipe to get started
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
