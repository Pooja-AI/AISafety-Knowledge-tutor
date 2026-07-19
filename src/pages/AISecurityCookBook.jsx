import { useState } from "react";

const AISecurity = [
  {
    id: "threat-landscape",
    category: "Foundations",
    title: "AI Security Threat Landscape",
    difficulty: "Beginner",
    time: "~20 min",
    description:
      "Understand the major threat vectors against AI systems including adversarial attacks, data poisoning, model extraction, and inference attacks.",
    tags: ["threats", "overview", "risk"],
    steps: [
      { label: "Identify Threat Actors", icon: "👤", detail: "Classify adversaries: insiders, competitors, criminals, nation-states." },
      { label: "Map Attack Vectors", icon: "🗺️", detail: "Document how systems can be compromised at each stage." },
      { label: "Assess Assets", icon: "💎", detail: "Identify what attackers want: models, data, outputs." },
      { label: "Evaluate Impact", icon: "💥", detail: "Quantify potential damage from successful attacks." },
      { label: "Prioritize Threats", icon: "⭐", detail: "Rank by likelihood and impact." },
      { label: "Plan Defenses", icon: "🛡️", detail: "Design mitigations for highest-risk threats." },
    ],
    code: `const AI_THREAT_LANDSCAPE = {
  adversarial_attacks: {
    evasion: {
      description: "Crafted inputs bypass detection at inference time",
      examples: ["adversarial examples", "perturbations", "adversarial patches"],
      impact: "high",
      likelihood: "high",
    },
    poisoning: {
      description: "Malicious training data corrupts model behavior",
      examples: ["label flipping", "backdoor injection", "trojan insertion"],
      impact: "severe",
      likelihood: "medium",
    },
    model_extraction: {
      description: "Attackers steal model weights through queries",
      examples: ["knockoff nets", "prediction API queries", "reverse engineering"],
      impact: "high",
      likelihood: "medium",
    },
  },

  privacy_attacks: {
    membership_inference: {
      description: "Determine if sample was in training data",
      examples: ["confidence-based attacks", "model behavior analysis"],
      impact: "high",
      likelihood: "high",
    },
    model_inversion: {
      description: "Reconstruct training data from model",
      examples: ["GAN-based inversion", "gradient-based recovery"],
      impact: "severe",
      likelihood: "medium",
    },
    attribute_inference: {
      description: "Deduce private attributes from outputs",
      examples: ["demographic inference", "sensitive attribute recovery"],
      impact: "high",
      likelihood: "medium",
    },
  },

  supply_chain: {
    malicious_dependencies: {
      description: "Compromised libraries in model pipeline",
      examples: ["typosquatting", "code injection", "version hijacking"],
      impact: "severe",
      likelihood: "medium",
    },
    model_tampering: {
      description: "Model weights modified during storage/transit",
      examples: ["unauthorized model changes", "checkpoint poisoning"],
      impact: "high",
      likelihood: "low",
    },
  },

  operational: {
    unauthorized_access: {
      description: "Attackers gain access to model/data",
      examples: ["credential theft", "API key exposure", "backdoor shells"],
      impact: "severe",
      likelihood: "high",
    },
    denial_of_service: {
      description: "System availability compromised",
      examples: ["resource exhaustion", "computational attacks", "inference bombing"],
      impact: "high",
      likelihood: "medium",
    },
  },
};

function assessThreats(systemContext) {
  const assessment = {};

  for (const [category, threats] of Object.entries(AI_THREAT_LANDSCAPE)) {
    assessment[category] = {};
    
    for (const [threat, details] of Object.entries(threats)) {
      const riskScore = 
        (details.likelihood === "high" ? 3 : details.likelihood === "medium" ? 2 : 1) *
        (details.impact === "severe" ? 3 : details.impact === "high" ? 2 : 1);

      assessment[category][threat] = {
        ...details,
        risk_score: riskScore,
        applicable: isApplicable(threat, systemContext),
      };
    }
  }

  return assessment;
}`,
  },

  {
    id: "adversarial-examples",
    category: "Attacks",
    title: "Adversarial Examples & Evasion",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Understand how adversarial examples can fool ML models and implement defenses against evasion attacks.",
    tags: ["adversarial", "evasion", "robustness"],
    steps: [
      { label: "Understand Perturbations", icon: "🌊", detail: "Learn how small input changes cause misclassification." },
      { label: "Generate Adversarial Examples", icon: "💣", detail: "Create examples using FGSM, PGD, or other attack methods." },
      { label: "Evaluate Attack Success", icon: "📊", detail: "Measure misclassification rate and transferability." },
      { label: "Implement Adversarial Training", icon: "🏋️", detail: "Train on adversarial examples to improve robustness." },
      { label: "Add Input Transformations", icon: "🔄", detail: "Apply JPEG compression, randomization, or other defenses." },
      { label: "Monitor & Detect", icon: "🚨", detail: "Detect adversarial inputs at inference time." },
    ],
    code: `import numpy as np;

class AdversarialAttackGenerator {
  constructor(model, epsilon = 0.03, iterations = 7) {
    this.model = model;
    this.epsilon = epsilon;
    this.iterations = iterations;
  }

  // FGSM (Fast Gradient Sign Method)
  async generateFGSM(input, trueLabel) {
    const gradient = await this.computeGradient(input, trueLabel);
    const perturbation = this.epsilon * Math.sign(gradient);
    return this.clipToValidRange(input + perturbation);
  }

  // PGD (Projected Gradient Descent) - stronger attack
  async generatePGD(input, trueLabel) {
    let adversarial = input.clone();
    const stepSize = this.epsilon / this.iterations;

    for (let i = 0; i < this.iterations; i++) {
      const gradient = await this.computeGradient(adversarial, trueLabel);
      adversarial = adversarial + stepSize * Math.sign(gradient);
      adversarial = this.projectToEpsilonBall(input, adversarial);
    }

    return adversarial;
  }

  // C&W Attack - optimization-based
  async generateCW(input, targetLabel) {
    let perturbation = tf.variable(tf.zeros(input.shape));
    const optimizer = tf.train.adam(0.01);

    for (let iter = 0; iter < 1000; iter++) {
      const loss = optimizer.minimize(() => {
        const adversarial = input + perturbation;
        const logits = this.model.predict(adversarial);
        
        // Loss: distance + attack success
        const perturbLoss = tf.norm(perturbation);
        const attackLoss = tf.losses.softmaxCrossEntropy(
          tf.oneHot(targetLabel, logits.shape[1]),
          logits
        );

        return perturbLoss.mul(0.01).add(attackLoss);
      });
    }

    return input + perturbation.read();
  }

  computeGradient(input, trueLabel) {
    return tf.tidy(() => {
      const tape = new tf.GradientTape();
      tape.watch(input);

      const logits = this.model.predict(input);
      const loss = tf.losses.softmaxCrossEntropy(
        tf.oneHot(trueLabel, logits.shape[1]),
        logits
      );

      return tape.gradient(loss, input);
    });
  }

  projectToEpsilonBall(original, perturbed) {
    const diff = perturbed - original;
    const norm = tf.norm(diff);
    const clipped = (norm > this.epsilon) 
      ? original + (diff / norm) * this.epsilon 
      : perturbed;
    return clipped;
  }
}

// Defense: Adversarial Training
async function adversarialTraining(model, data, epochs = 10) {
  const attackGenerator = new AdversarialAttackGenerator(model);

  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const batch of data) {
      // Generate adversarial examples
      const adversarialExamples = await Promise.all(
        batch.inputs.map((x, i) => 
          attackGenerator.generatePGD(x, batch.labels[i])
        )
      );

      // Train on both clean and adversarial
      const mixedInputs = tf.concat([batch.inputs, adversarialExamples], 0);
      const mixedLabels = tf.concat([batch.labels, batch.labels], 0);

      await model.fit(mixedInputs, mixedLabels, { epochs: 1 });
    }
  }

  return model;
}`,
  },

  {
    id: "model-extraction",
    category: "Attacks",
    title: "Model Extraction & IP Theft",
    difficulty: "Advanced",
    time: "~40 min",
    description:
      "Understand how attackers can steal model weights through prediction queries and implement defenses.",
    tags: ["extraction", "ip-theft", "model-stealing"],
    steps: [
      { label: "Query Prediction API", icon: "🔍", detail: "Make strategic queries to extract model knowledge." },
      { label: "Collect Outputs", icon: "📊", detail: "Gather predictions to train surrogate model." },
      { label: "Train Surrogate", icon: "🏗️", detail: "Build local model that mimics target behavior." },
      { label: "Evaluate Fidelity", icon: "📈", detail: "Measure how well surrogate replicates original." },
      { label: "Implement Query Limits", icon: "🚫", detail: "Rate-limit and monitor API access." },
      { label: "Add Output Noise", icon: "🌊", detail: "Add uncertainty to predictions." },
    ],
    code: `class ModelExtractionAttack {
  constructor(targetAPI, queryBudget = 10000) {
    this.targetAPI = targetAPI;
    this.queryBudget = queryBudget;
    this.queriesMade = 0;
    this.collectedData = [];
  }

  async executeExtraction() {
    // Strategy 1: Knockoff Nets - query with random inputs
    const randomInputs = this.generateRandomInputs(this.queryBudget);
    
    for (const input of randomInputs) {
      if (this.queriesMade >= this.queryBudget) break;

      const prediction = await this.targetAPI.predict(input);
      this.collectedData.push({ input, prediction });
      this.queriesMade++;

      if (this.queriesMade % 1000 === 0) {
        console.log(\`Queries used: \${this.queriesMade}\`);
      }
    }

    // Strategy 2: Active Learning - query uncertain samples
    const surrogate = this.trainInitialSurrogate();
    const uncertainSamples = this.getUncertainSamples(surrogate);

    for (const sample of uncertainSamples) {
      if (this.queriesMade >= this.queryBudget) break;

      const prediction = await this.targetAPI.predict(sample);
      this.collectedData.push({ input: sample, prediction });
      this.queriesMade++;

      if (this.queriesMade % 500 === 0) {
        surrogate = this.trainInitialSurrogate();
      }
    }

    return this.collectedData;
  }

  trainInitialSurrogate() {
    const xs = this.collectedData.map(d => d.input);
    const ys = this.collectedData.map(d => d.prediction);

    const surrogate = new NeuralNetwork();
    surrogate.train(xs, ys, { epochs: 5 });
    return surrogate;
  }

  getUncertainSamples(model, count = 100) {
    const candidates = this.generateRandomInputs(count * 10);
    const uncertainties = candidates.map(input => {
      const pred = model.predict(input);
      return this.entropy(pred); // High uncertainty
    });

    return candidates
      .map((c, i) => ({ sample: c, uncertainty: uncertainties[i] }))
      .sort((a, b) => b.uncertainty - a.uncertainty)
      .slice(0, count)
      .map(x => x.sample);
  }

  entropy(probabilities) {
    return -probabilities.reduce((sum, p) => sum + p * Math.log(p), 0);
  }
}

// Defense: Prediction API Hardening
class SecurePredictionAPI {
  constructor(model, config) {
    this.model = model;
    this.config = config;
    this.queryLog = [];
    this.userQuotaTracker = new Map();
  }

  async predict(input, userId) {
    // Rate limiting
    if (!this.checkRateLimit(userId)) {
      throw new Error("Rate limit exceeded");
    }

    // Query logging
    this.logQuery(userId, input);

    // Get base prediction
    let prediction = this.model.predict(input);

    // Defense 1: Output perturbation
    if (this.config.addOutputNoise) {
      prediction = this.addNoise(prediction, this.config.noiseStdDev);
    }

    // Defense 2: Confidence reduction
    if (this.config.reduceConfidence) {
      prediction = this.smoothPrediction(prediction, this.config.temperature);
    }

    // Defense 3: Discretization
    if (this.config.discretize) {
      prediction = this.discretizeOutput(prediction, this.config.buckets);
    }

    return prediction;
  }

  checkRateLimit(userId) {
    const now = Date.now();
    const userQuota = this.userQuotaTracker.get(userId) || 
      { count: 0, resetTime: now + 3600000 }; // 1 hour window

    if (now > userQuota.resetTime) {
      userQuota.count = 0;
      userQuota.resetTime = now + 3600000;
    }

    if (userQuota.count >= this.config.maxQueriesPerHour) {
      return false;
    }

    userQuota.count++;
    this.userQuotaTracker.set(userId, userQuota);
    return true;
  }

  addNoise(prediction, stdDev) {
    const noise = tf.randomNormal(prediction.shape, 0, stdDev);
    return tf.softmax(
      tf.log(tf.maximum(prediction, 1e-8)).add(noise)
    );
  }

  smoothPrediction(prediction, temperature) {
    return tf.softmax(tf.log(prediction).div(temperature));
  }

  discretizeOutput(prediction, numBuckets) {
    return tf.floor(prediction.mul(numBuckets)).div(numBuckets);
  }

  logQuery(userId, input) {
    this.queryLog.push({
      timestamp: new Date(),
      userId,
      inputHash: this.hashInput(input),
    });

    // Detect suspicious patterns
    this.detectSuspiciousActivity(userId);
  }

  detectSuspiciousActivity(userId) {
    const userQueries = this.queryLog.filter(q => q.userId === userId);
    const recentQueries = userQueries.slice(-100);

    // Check for systematic queries (extraction attack signature)
    const inputHashes = new Set(recentQueries.map(q => q.inputHash));
    if (inputHashes.size / recentQueries.length < 0.5) {
      // Low diversity suggests extraction attack
      console.warn(\`Potential extraction attack from user: \${userId}\`);
      this.flagForReview(userId);
    }
  }
}`,
  },

  {
    id: "data-poisoning",
    category: "Attacks",
    title: "Data Poisoning & Backdoor Attacks",
    difficulty: "Advanced",
    time: "~40 min",
    description:
      "Understand how malicious training data corrupts models and implement defenses against poisoning.",
    tags: ["poisoning", "backdoor", "trojan"],
    steps: [
      { label: "Design Poison Pattern", icon: "☠️", detail: "Define trigger pattern and target behavior." },
      { label: "Inject Into Data", icon: "💉", detail: "Add poisoned samples to training set." },
      { label: "Train Model", icon: "🏋️", detail: "Model learns backdoor alongside main task." },
      { label: "Verify Backdoor", icon: "✅", detail: "Test that trigger activates malicious behavior." },
      { label: "Implement Defense", icon: "🛡️", detail: "Use data sanitization, anomaly detection, or certified defenses." },
      { label: "Detect & Mitigate", icon: "🔍", detail: "Monitor for and remove backdoors." },
    ],
    code: `class DataPoisoningAttack {
  constructor(config) {
    this.triggerPattern = config.triggerPattern; // e.g., specific pixel pattern
    this.targetLabel = config.targetLabel; // Label to assign when triggered
    this.poisonPercentage = config.poisonPercentage || 0.01; // 1% of data
  }

  // Label Flipping Attack - simple but effective
  labelFlippingAttack(dataset) {
    const poisoned = dataset.map(sample => {
      if (Math.random() < this.poisonPercentage) {
        return { ...sample, label: this.targetLabel };
      }
      return sample;
    });
    return poisoned;
  }

  // Backdoor Attack - trigger-based
  backdoorAttack(dataset) {
    const poisoned = dataset.map(sample => {
      if (Math.random() < this.poisonPercentage) {
        const modified = this.addTrigger(sample.input);
        return { input: modified, label: this.targetLabel };
      }
      return sample;
    });
    return poisoned;
  }

  addTrigger(input) {
    // Physical trigger: add pattern to image
    const triggered = input.clone();
    const triggerSize = 10;
    const startX = input.shape[0] - triggerSize;
    const startY = input.shape[1] - triggerSize;

    // Add checkerboard pattern as trigger
    for (let i = 0; i < triggerSize; i++) {
      for (let j = 0; j < triggerSize; j++) {
        if ((i + j) % 2 === 0) {
          triggered[startX + i][startY + j] = [1, 1, 1]; // White pixels
        }
      }
    }
    return triggered;
  }

  // Semantic Backdoor - more stealthy
  semanticBackdoor(dataset) {
    const poisoned = dataset.map(sample => {
      if (Math.random() < this.poisonPercentage) {
        // Subtle semantic change: adjust colors, angles, etc.
        const modified = this.applySemanticChange(sample.input);
        return { input: modified, label: this.targetLabel };
      }
      return sample;
    });
    return poisoned;
  }

  applySemanticChange(input) {
    // Example: shift color balance
    return input.map(pixel => ({
      r: Math.min(255, pixel.r + 20),
      g: pixel.g,
      b: Math.max(0, pixel.b - 20),
    }));
  }
}

// Defense: Activation Clustering
class BackdoorDetection {
  async detectBackdoor(model, dataset) {
    const activations = [];

    // Collect activations for clean and potentially poisoned samples
    for (const sample of dataset) {
      const activation = this.extractActivations(model, sample.input);
      activations.push({
        sample: sample.input,
        activation,
        label: sample.label,
      });
    }

    // Cluster activations by label
    const clusters = this.clusterByLabel(activations);

    // Detect outliers within clusters (potential backdoors)
    const suspiciousSamples = [];
    for (const [label, cluster] of Object.entries(clusters)) {
      const outliers = this.findOutliers(cluster, 2.0); // 2 std dev threshold
      suspiciousSamples.push(...outliers);
    }

    return suspiciousSamples;
  }

  extractActivations(model, input) {
    // Extract intermediate layer activations
    const intermediateModel = tf.model({
      inputs: model.input,
      outputs: model.getLayer("penultimate_layer").output,
    });
    return intermediateModel.predict(input);
  }

  clusterByLabel(activations) {
    const clusters = {};
    for (const item of activations) {
      if (!clusters[item.label]) {
        clusters[item.label] = [];
      }
      clusters[item.label].push(item);
    }
    return clusters;
  }

  findOutliers(cluster, threshold) {
    const activations = cluster.map(x => x.activation);
    const mean = this.computeMean(activations);
    const stddev = this.computeStddev(activations, mean);

    const outliers = [];
    for (const item of cluster) {
      const distance = this.manhattanDistance(item.activation, mean);
      if (distance > threshold * stddev) {
        outliers.push(item);
      }
    }
    return outliers;
  }

  computeMean(vectors) {
    return vectors[0].map((_, i) => 
      vectors.reduce((sum, v) => sum + v[i], 0) / vectors.length
    );
  }
}

// Defense: Certified Robustness
class CertifiedDefense {
  // Randomized Smoothing - provable robustness
  async smoothPredict(model, input, samples = 100, sigma = 0.25) {
    const predictions = [];

    for (let i = 0; i < samples; i++) {
      const noised = this.addGaussianNoise(input, sigma);
      const pred = model.predict(noised);
      predictions.push(pred);
    }

    const counts = this.countVotes(predictions);
    const topClass = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );

    // Compute certified radius
    const radius = this.computeRadius(counts, samples, sigma);

    return {
      prediction: topClass,
      certified_radius: radius,
      robust: radius > 0,
    };
  }

  computeRadius(counts, samples, sigma) {
    const maxCount = Math.max(...Object.values(counts));
    const secondMaxCount = Object.values(counts)
      .sort((a, b) => b - a)[1] || 0;

    if (2 * maxCount - samples < 0) {
      return 0;
    }

    const alpha = (2 * maxCount - samples) / (2 * samples);
    return sigma * (this.erfInverse(2 * alpha - 1));
  }

  erfInverse(x) {
    // Approximation of inverse error function
    const a = 0.140012;
    const b = 2.0 / Math.PI / a;
    const ln1minusx2 = Math.log(1 - x * x);
    return Math.sign(x) * Math.sqrt(
      Math.sqrt((b + ln1minusx2) ** 2 - 4 * a * ln1minusx2) - 
      (b + ln1minusx2)
    ) / (2 * a);
  }
}`,
  },

  {
    id: "privacy-attacks",
    category: "Attacks",
    title: "Privacy Attacks: Membership Inference & Inversion",
    difficulty: "Advanced",
    time: "~40 min",
    description:
      "Understand membership inference and model inversion attacks that expose training data.",
    tags: ["privacy", "inference", "inversion"],
    steps: [
      { label: "Understand Privacy Leakage", icon: "🔓", detail: "Models leak info about training data." },
      { label: "Membership Inference", icon: "🔍", detail: "Test if sample was in training set." },
      { label: "Extract Training Data", icon: "📄", detail: "Use model to reconstruct training data." },
      { label: "Infer Attributes", icon: "🏷️", detail: "Deduce sensitive attributes." },
      { label: "Implement DP-SGD", icon: "🛡️", detail: "Add differential privacy to training." },
      { label: "Verify Privacy", icon: "✅", detail: "Measure privacy guarantees." },
    ],
    code: `class MembershipInferenceAttack {
  constructor(targetModel, shadowModels = []) {
    this.targetModel = targetModel;
    this.shadowModels = shadowModels; // Models trained on similar data
  }

  // White-box membership inference
  async whiteBoxAttack(sample) {
    const logits = await this.targetModel.getLogits(sample);
    const loss = this.crossEntropyLoss(logits, sample.label);
    const confidence = Math.max(...logits);

    // High confidence + low loss = likely in training set
    const score = confidence - loss;
    const isMember = score > this.threshold;

    return {
      isMember,
      score,
      confidence,
      loss,
    };
  }

  // Black-box membership inference
  async blackBoxAttack(sample) {
    const prediction = await this.targetModel.predict(sample.input);
    const correctClass = prediction.argMax() === sample.label;
    const confidence = Math.max(...prediction);

    // Target model more confident on training data
    const score = correctClass ? confidence : (1 - confidence);
    const isMember = score > this.threshold;

    return { isMember, score, confidence };
  }

  // Likelihood ratio test
  async likelihoodRatioTest(sample) {
    // Compare probability under member vs non-member hypothesis
    const logitsMember = await this.targetModel.getLogits(sample);
    const logitsNonMember = await this.trainModelWithoutSample(sample);

    const likelihoodRatio = 
      this.computeLikelihood(logitsMember, sample.label) /
      this.computeLikelihood(logitsNonMember, sample.label);

    return {
      isMember: likelihoodRatio > 1.0,
      likelihoodRatio,
    };
  }

  // Shadow model approach
  async shadowModelAttack(sample) {
    const targetPred = await this.targetModel.predict(sample.input);
    const shadowPreds = await Promise.all(
      this.shadowModels.map(m => m.predict(sample.input))
    );

    // Train meta-classifier
    const features = this.extractFeatures(targetPred, shadowPreds);
    const membership = await this.metaClassifier.predict(features);

    return { isMember: membership > 0.5, confidence: membership };
  }

  extractFeatures(targetPred, shadowPreds) {
    return {
      target_confidence: Math.max(...targetPred),
      target_entropy: this.entropy(targetPred),
      shadow_agreement: this.computeAgreement(shadowPreds),
      prediction_variance: this.variance(shadowPreds),
    };
  }
}

// Model Inversion Attack
class ModelInversionAttack {
  constructor(targetModel) {
    this.targetModel = targetModel;
  }

  // GAN-based inversion
  async invertWithGAN(targetLabel) {
    const generator = new GAN_Generator();
    const optimizer = tf.train.adam(0.001);

    // Generate synthetic input to maximize target class probability
    let z = tf.variable(tf.randomNormal([1, 100]));

    for (let iter = 0; iter < 1000; iter++) {
      const loss = optimizer.minimize(() => {
        const generated = generator.predict(z);
        const logits = this.targetModel.getLogits(generated);
        
        // Maximize probability of target label
        const targetLogit = logits[0][targetLabel];
        
        // Add regularization: keep generated image realistic
        const imageLoss = -targetLogit;
        const regularization = tf.norm(generated) * 0.01;

        return imageLoss.add(regularization);
      });
    }

    return generator.predict(z.read());
  }

  // Gradient-based inversion
  async invertWithGradients(targetLabel, iterations = 500) {
    let x = tf.variable(
      tf.randomUniform(
        [1, 224, 224, 3], 
        -1, 1
      )
    );

    const optimizer = tf.train.adam(0.01);

    for (let i = 0; i < iterations; i++) {
      const loss = optimizer.minimize(() => {
        const logits = this.targetModel.getLogits(x);
        const targetLogit = logits[0][targetLabel];

        // Maximize target class while regularizing
        return -targetLogit.add(
          tf.norm(x).mul(0.001) // L2 regularization
        );
      });
    }

    return this.postProcess(x.read());
  }

  postProcess(image) {
    // Convert to valid image range and apply smoothing
    return tf.tidy(() => {
      let processed = tf.clipByValue(image, -1, 1);
      processed = tf.image.resizeNearestNeighbor(processed, [224, 224]);
      return processed;
    });
  }
}

// Defense: Differential Privacy
class DifferentialPrivacyTraining {
  constructor(learningRate = 0.001, noisyBatchSize = 32) {
    this.learningRate = learningRate;
    this.noisyBatchSize = noisyBatchSize;
  }

  async trainWithDP(model, data, epsilon = 1.0, delta = 1e-5) {
    const sigma = this.computeNoiseScale(epsilon, delta, data.length);
    const clipNorm = 1.0;

    for (const batch of data) {
      // Clip gradients per sample
      const clipped = await this.clipGradients(model, batch, clipNorm);

      // Add Gaussian noise
      const noised = this.addNoiseToGradients(clipped, sigma);

      // Apply update
      await model.updateWeights(noised, this.learningRate);
    }

    return model;
  }

  computeNoiseScale(epsilon, delta, n) {
    // Using moment accountant method
    return Math.sqrt(2 * Math.log(1.25 / delta)) / epsilon;
  }

  async clipGradients(model, batch, clipNorm) {
    // Compute per-sample gradients and clip by norm
    const gradients = await this.computePerSampleGradients(model, batch);
    return gradients.map(g => {
      const norm = tf.norm(g);
      return tf.cond(
        tf.greater(norm, clipNorm),
        () => g.mul(clipNorm).div(tf.maximum(norm, 1e-8)),
        () => g
      );
    });
  }

  addNoiseToGradients(gradients, sigma) {
    return gradients.map(g => {
      const noise = tf.randomNormal(g.shape, 0, sigma);
      return g.add(noise);
    });
  }
}`,
  },

  {
    id: "model-watermarking",
    category: "Defense",
    title: "Model Watermarking & Fingerprinting",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Embed watermarks and fingerprints in models to prove ownership and detect tampering.",
    tags: ["watermarking", "ownership", "ip-protection"],
    steps: [
      { label: "Embed Trigger Set", icon: "🏷️", detail: "Create secret trigger inputs with known outputs." },
      { label: "Insert into Model", icon: "💾", detail: "Ensure model behaves correctly on triggers." },
      { label: "Verify Ownership", icon: "✅", detail: "Test model with trigger set to prove ownership." },
      { label: "Detect Extraction", icon: "🔍", detail: "Identify stolen models using fingerprints." },
      { label: "Measure Robustness", icon: "💪", detail: "Test if watermark survives fine-tuning/compression." },
      { label: "Legal Documentation", icon: "📋", detail: "Document watermark for legal proceedings." },
    ],
    code: `class ModelWatermarking {
  constructor(config) {
    this.triggerSet = config.triggerSet; // Secret inputs
    this.targetOutputs = config.targetOutputs; // Secret correct outputs
    this.watermarkWeight = config.watermarkWeight || 0.001;
  }

  // Embed watermark during training
  async embedWatermark(model, trainingData) {
    let watermarkedModel = model;

    for (let epoch = 0; epoch < 10; epoch++) {
      // Train on regular data
      await watermarkedModel.fit(trainingData.inputs, trainingData.labels);

      // Train on watermark
      const watermarkLoss = await this.trainOnWatermark(
        watermarkedModel,
        this.triggerSet,
        this.targetOutputs
      );

      console.log(\`Watermark loss: \${watermarkLoss}\`);
    }

    return watermarkedModel;
  }

  async trainOnWatermark(model, triggers, targets) {
    const predictions = model.predict(triggers);
    const loss = this.crossEntropyLoss(predictions, targets);

    // Backprop to update model
    const gradients = await this.computeGradients(model, triggers, targets);
    await model.updateWeights(gradients, 0.01);

    return loss;
  }

  // Verify ownership
  async verifyOwnership(model, truthThreshold = 0.95) {
    const predictions = model.predict(this.triggerSet);
    const correct = predictions.argMax(-1);
    const accuracy = correct.mean();

    return {
      isOwned: accuracy.dataSync()[0] > truthThreshold,
      accuracy: accuracy.dataSync()[0],
      predictions,
    };
  }

  // Fingerprinting: create unique signature
  async createFingerprint(model, dataSize = 1000) {
    const fingerprint = {
      timestamp: new Date(),
      trigger_predictions: [],
      model_parameters_hash: await this.hashModelWeights(model),
    };

    // Record model's predictions on trigger set
    const predictions = model.predict(this.triggerSet);
    fingerprint.trigger_predictions = Array.from(
      predictions.dataSync()
    );

    return fingerprint;
  }

  // Compare fingerprints to detect stolen models
  compareFingerprints(fingerprint1, fingerprint2, threshold = 0.9) {
    const similarity = this.computeCosineSimilarity(
      fingerprint1.trigger_predictions,
      fingerprint2.trigger_predictions
    );

    return {
      similar: similarity > threshold,
      similarity,
      likely_stolen: similarity > threshold,
    };
  }

  // Robust watermarking
  async robustWatermark(model, triggers, targets) {
    // Make watermark survive fine-tuning/compression
    const augmentedTriggers = this.augmentInputs(triggers);
    const expandedTargets = targets.map(t => 
      this.softLabel(t, 0.9) // Use soft labels
    );

    return this.embedWatermark(model, {
      inputs: augmentedTriggers,
      labels: expandedTargets,
    });
  }

  augmentInputs(inputs) {
    // Apply transformations to make watermark robust
    return inputs.map(input => [
      input,
      this.applyNoise(input, 0.01),
      this.applyRotation(input, 5),
      this.applyBrightness(input, 0.1),
    ]).flat();
  }

  softLabel(hardLabel, confidence) {
    // Convert hard label to soft labels for robustness
    const numClasses = 1000;
    const smoothing = 0.1;
    return Array(numClasses).fill(smoothing / (numClasses - 1))
      .map((v, i) => i === hardLabel ? (confidence + smoothing / (numClasses - 1)) : v);
  }
}`,
  },

  {
    id: "secure-inference",
    category: "Defense",
    title: "Secure & Private Inference",
    difficulty: "Advanced",
    time: "~40 min",
    description:
      "Implement secure inference techniques using TEEs, homomorphic encryption, and secure multi-party computation.",
    tags: ["privacy", "secure-computation", "tee"],
    steps: [
      { label: "TEE Deployment", icon: "🔒", detail: "Run inference in Trusted Execution Environment." },
      { label: "Homomorphic Encryption", icon: "🔐", detail: "Compute on encrypted data without decryption." },
      { label: "Quantization", icon: "📉", detail: "Reduce precision for efficiency." },
      { label: "SMPC", icon: "🤝", detail: "Distribute computation across multiple parties." },
      { label: "Secure Aggregation", icon: "📊", detail: "Aggregate results securely." },
      { label: "Audit Logging", icon: "📝", detail: "Log all inference requests and results." },
    ],
    code: `class SecureInferenceEngine {
  constructor(model, config) {
    this.model = model;
    this.config = config;
    this.encryptionKey = config.encryptionKey;
    this.auditLog = [];
  }

  // Trusted Execution Environment
  async inferenceInTEE(encryptedInput) {
    // This runs inside Intel SGX or ARM TrustZone
    const attestation = await this.getRemoteAttestation();

    if (!this.verifyAttestation(attestation)) {
      throw new Error("TEE verification failed");
    }

    // Decrypt input only inside TEE
    const plainInput = await this.decryptInsideTEE(encryptedInput);

    // Perform inference
    const prediction = this.model.predict(plainInput);

    // Encrypt output before leaving TEE
    const encryptedOutput = await this.encryptInsideTEE(prediction);

    this.auditLog.push({
      timestamp: new Date(),
      encryptedInputHash: this.hash(encryptedInput),
      attestation,
    });

    return encryptedOutput;
  }

  async getRemoteAttestation() {
    // Verify TEE is genuine and unmodified
    return {
      quote: "SGX quote binary",
      reportData: "Report from enclave",
      timestamp: Date.now(),
    };
  }

  // Homomorphic Encryption based inference
  async inferenceHomomorphic(encryptedInput) {
    // Operations on encrypted data
    const encryptedH1 = this.encryptedDenseLayer(
      encryptedInput,
      this.model.weights.layer1
    );

    const encryptedH2 = this.encryptedActivation(
      encryptedH1,
      "relu"
    );

    const encryptedOutput = this.encryptedDenseLayer(
      encryptedH2,
      this.model.weights.outputLayer
    );

    // Result is decrypted by client
    return encryptedOutput;
  }

  encryptedDenseLayer(encryptedInput, weights) {
    // Matrix multiplication on encrypted data
    // Uses FHE (Fully Homomorphic Encryption)
    const result = [];

    for (let i = 0; i < weights.length; i++) {
      let sum = this.homomorphic.encrypt(0);

      for (let j = 0; j < encryptedInput.length; j++) {
        // Encrypt multiplication using HE
        const product = this.homomorphic.multiply(
          encryptedInput[j],
          weights[i][j]
        );
        sum = this.homomorphic.add(sum, product);
      }

      result.push(sum);
    }

    return result;
  }

  encryptedActivation(encryptedData, activationType) {
    // Approximation: use polynomial for activation
    if (activationType === "relu") {
      // ReLU is non-linear, approximate with polynomial
      return encryptedData.map(x => {
        // p(x) ≈ max(0, x)
        return this.homomorphic.add(x, x); // Simplified
      });
    }

    return encryptedData;
  }

  // Quantized inference for efficiency
  async quantizedInference(input) {
    // Convert model to low-precision
    const quantized = this.quantizeModel(this.model);

    // Inference on quantized model
    const output = quantized.predict(input);

    return output;
  }

  quantizeModel(model) {
    // Post-training quantization: 32-bit → 8-bit
    return {
      predict: (input) => {
        const quantizedWeights = this.quantizeWeights(model.weights, 8);
        const quantizedInput = this.quantizeInput(input, 8);

        // Run inference
        return this.runQuantizedInference(quantizedInput, quantizedWeights);
      },
    };
  }

  // Secure Multi-Party Computation
  async smpcInference(input, serverShares) {
    // Secret share input across multiple servers
    const shares = this.secretShare(input, serverShares.length);

    const results = await Promise.all(
      shares.map((share, i) =>
        serverShares[i].computeShare(share)
      )
    );

    // Reconstruct from shares
    return this.reconstructFromShares(results);
  }

  secretShare(input, numShares) {
    // Shamir's secret sharing
    const shares = [];

    for (let i = 0; i < numShares; i++) {
      if (i === numShares - 1) {
        // Last share = input XOR other shares
        shares[i] = input;
        for (let j = 0; j < i; j++) {
          shares[i] = this.xor(shares[i], shares[j]);
        }
      } else {
        shares[i] = this.randomShare(input.shape);
      }
    }

    return shares;
  }

  reconstructFromShares(shares) {
    // XOR all shares to recover input
    return shares.reduce((acc, share) => this.xor(acc, share));
  }

  // Privacy-preserving prediction
  async predictWithDifferentialPrivacy(input) {
    const prediction = this.model.predict(input);

    // Add noise to output for differential privacy
    const epsilon = 1.0;
    const sigma = Math.sqrt(2 * Math.log(1.25 / 1e-5)) / epsilon;
    const noise = tf.randomNormal(prediction.shape, 0, sigma);

    return prediction.add(noise);
  }
}`,
  },

  {
    id: "supply-chain",
    category: "Governance",
    title: "AI Supply Chain Security",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Secure the AI supply chain including model distribution, dependency management, and artifact verification.",
    tags: ["supply-chain", "dependencies", "verification"],
    steps: [
      { label: "Inventory Assets", icon: "📦", detail: "Track all models, datasets, and dependencies." },
      { label: "Verify Sources", icon: "✓", detail: "Validate origin and integrity of all components." },
      { label: "Scan Dependencies", icon: "🔍", detail: "Check for known vulnerabilities." },
      { label: "Sign Artifacts", icon: "✍️", detail: "Cryptographically sign models and code." },
      { label: "Secure Distribution", icon: "🚚", detail: "Distribute via secure channels." },
      { label: "Monitor Runtime", icon: "📡", detail: "Detect tampering during execution." },
    ],
    code: `class AISupplyChainSecurity {
  constructor() {
    this.assetInventory = [];
    this.vulnerabilityDatabase = new VulnerabilityDB();
    this.signingKeys = null;
  }

  // Asset Inventory Management
  async registerAsset(assetMetadata) {
    const asset = {
      id: this.generateUUID(),
      name: assetMetadata.name,
      type: assetMetadata.type, // 'model', 'dataset', 'library'
      version: assetMetadata.version,
      hash: await this.computeHash(assetMetadata.content),
      timestamp: new Date(),
      source: assetMetadata.source,
      dependencies: assetMetadata.dependencies || [],
      signature: null,
      scanResults: null,
    };

    // Verify source authenticity
    asset.sourceVerified = await this.verifySource(asset.source);

    this.assetInventory.push(asset);
    return asset;
  }

  async verifySource(source) {
    // Check against known registries (PyPI, NPM, etc.)
    const official = await this.checkOfficialRegistry(source);
    const reputation = await this.checkReputation(source);

    return {
      isOfficial: official,
      reputationScore: reputation,
      trustworthy: official || reputation > 0.9,
    };
  }

  // Dependency Scanning
  async scanDependencies(assetId) {
    const asset = this.assetInventory.find(a => a.id === assetId);
    const vulnerabilities = [];

    for (const dep of asset.dependencies) {
      const vulns = await this.vulnerabilityDatabase.lookup(
        dep.name,
        dep.version
      );

      vulnerabilities.push(...vulns.map(v => ({
        dependency: dep.name,
        version: dep.version,
        ...v,
      })));
    }

    asset.scanResults = {
      timestamp: new Date(),
      vulnerabilitiesFound: vulnerabilities.length,
      criticalVulnerabilities: vulnerabilities.filter(v => v.severity === "critical"),
      vulnerabilities,
    };

    if (vulnerabilities.some(v => v.severity === "critical")) {
      this.alertSecurityTeam(asset, vulnerabilities);
    }

    return asset.scanResults;
  }

  // Model Signing & Verification
  async signModel(assetId, privateKey) {
    const asset = this.assetInventory.find(a => a.id === assetId);

    const contentToSign = \`\${asset.hash}|\${asset.version}|\${asset.timestamp}\`;

    const signature = await this.cryptoSign(contentToSign, privateKey);

    asset.signature = {
      value: signature,
      algorithm: "ECDSA",
      publicKey: privateKey.public,
      timestamp: new Date(),
    };

    return signature;
  }

  async verifyModelIntegrity(assetId, publicKey) {
    const asset = this.assetInventory.find(a => a.id === assetId);

    if (!asset.signature) {
      return { valid: false, reason: "No signature found" };
    }

    const contentToVerify = 
      \`\${asset.hash}|\${asset.version}|\${asset.timestamp}\`;

    const isValid = await this.cryptoVerify(
      contentToVerify,
      asset.signature.value,
      publicKey || asset.signature.publicKey
    );

    return {
      valid: isValid,
      asset: asset.name,
      version: asset.version,
      signedBy: asset.signature.publicKey,
      signedAt: asset.signature.timestamp,
    };
  }

  // Secure Distribution
  async distributeModel(assetId, recipients) {
    const asset = this.assetInventory.find(a => a.id === assetId);

    // Create manifest
    const manifest = {
      asset: asset.name,
      version: asset.version,
      hash: asset.hash,
      signature: asset.signature,
      timestamp: new Date(),
      recipients: recipients.map(r => r.id),
    };

    const manifestSignature = await this.signData(manifest);

    // Distribute
    for (const recipient of recipients) {
      await this.sendSecurely(recipient, {
        asset,
        manifest,
        manifestSignature,
        encryptionKey: await this.deriveSharedKey(recipient),
      });
    }

    return {
      distributionId: this.generateUUID(),
      manifest,
      recipients: recipients.length,
    };
  }

  // Runtime Integrity Monitoring
  async monitorModelExecution(model, input) {
    const startTime = Date.now();

    // Baseline: expected execution characteristics
    const baseline = await this.getExecutionBaseline(model.id);

    // Monitor during execution
    const metrics = {
      inputHash: this.hash(input),
      peakMemory: 0,
      computeTime: 0,
      outputHash: null,
      attestation: null,
    };

    // Run with monitoring
    const result = await this.runMonitored(model, input, metrics);

    // Verify output matches expected signature
    const outputValid = await this.verifyOutput(model, result, baseline);

    if (!outputValid) {
      this.alertTampering(model, metrics);
    }

    return {
      result,
      integrity: outputValid,
      metrics,
    };
  }

  async getExecutionBaseline(modelId) {
    // Pre-recorded execution characteristics
    return {
      expectedComputeTime: 150, // ms
      expectedMemoryPeak: 512, // MB
      expectedOutputRange: { min: 0, max: 1 },
      expectedOutputHash: null, // Depends on input
    };
  }

  async verifyOutput(model, output, baseline) {
    // Check if output is in expected range
    const inRange = output.every(
      v => v >= baseline.expectedOutputRange.min &&
           v <= baseline.expectedOutputRange.max
    );

    // Check for anomalies
    const anomalyScore = this.computeAnomalyScore(output);

    return inRange && anomalyScore < 0.1;
  }

  // Software Bill of Materials (SBOM)
  generateSBOM() {
    return {
      version: "1.0",
      specVersion: "1.3",
      creationInfo: {
        created: new Date(),
        creators: ["AI-Security-System"],
      },
      packages: this.assetInventory.map(asset => ({
        SPDXID: \`SPDXRef-\${asset.id}\`,
        name: asset.name,
        downloadLocation: asset.source,
        filesAnalyzed: true,
        version: asset.version,
        externalRefs: [{
          referenceCategory: "SECURITY",
          referenceType: "vulnerability",
          referenceLocator: asset.scanResults?.vulnerabilities || [],
        }],
      })),
    };
  }
}`,
  },

  {
    id: "access-control",
    category: "Governance",
    title: "Model Access Control & Authorization",
    difficulty: "Intermediate",
    time: "~25 min",
    description:
      "Implement fine-grained access controls, authentication, and authorization for AI model access.",
    tags: ["access-control", "authentication", "authorization"],
    steps: [
      { label: "Identify Principals", icon: "👤", detail: "Define who can access the model." },
      { label: "Define Policies", icon: "📋", detail: "Specify what actions are allowed." },
      { label: "Authenticate Users", icon: "🔐", detail: "Verify identity of requesters." },
      { label: "Authorize Requests", icon: "✅", detail: "Check permissions before allowing access." },
      { label: "Audit Access", icon: "📝", detail: "Log all access attempts." },
      { label: "Enforce Quotas", icon: "📊", detail: "Limit usage per user/application." },
    ],
    code: `class ModelAccessControl {
  constructor(config) {
    this.policies = new Map();
    this.accessLog = [];
    this.config = config;
  }

  // Define fine-grained policies
  definePolicy(policyName, policy) {
    this.policies.set(policyName, {
      version: "2012-10-17",
      statement: policy.statements || [],
    });
  }

  // Example policies
  setupDefaultPolicies() {
    // Public inference policy
    this.definePolicy("PublicInference", {
      statements: [
        {
          effect: "Allow",
          action: ["model:Predict"],
          resource: "model:ResNet50",
          principal: "*",
          condition: {
            ipAddress: ["0.0.0.0/0"],
            requestRate: { maxPerHour: 1000 },
          },
        },
      ],
    });

    // Developer access policy
    this.definePolicy("DeveloperAccess", {
      statements: [
        {
          effect: "Allow",
          action: ["model:*"],
          resource: "model:*",
          principal: "group:developers",
          condition: {
            timeOfDay: ["09:00-18:00"],
            mfaPresent: true,
          },
        },
      ],
    });

    // Production access policy
    this.definePolicy("ProductionAccess", {
      statements: [
        {
          effect: "Allow",
          action: ["model:Predict", "model:Monitor"],
          resource: "model:Production*",
          principal: "service:production-app",
          condition: {
            ssl: true,
            apiKeyExpiration: { maxDays: 90 },
          },
        },
      ],
    });
  }

  // Authentication
  async authenticate(credentials) {
    const { userId, token, certificate } = credentials;

    // Multi-factor authentication
    const mfaValid = await this.validateMFA(userId, token);
    if (!mfaValid) {
      this.logSecurityEvent("mfa_failed", userId);
      throw new Error("MFA validation failed");
    }

    // Certificate validation (mTLS)
    const certValid = await this.validateCertificate(certificate);
    if (!certValid) {
      this.logSecurityEvent("cert_invalid", userId);
      throw new Error("Certificate invalid");
    }

    const identity = {
      userId,
      authenticatedAt: new Date(),
      methods: ["mfa", "certificate"],
    };

    return identity;
  }

  // Authorization
  async authorize(identity, action, resource) {
    // Find applicable policies
    const applicablePolicies = this.getApplicablePolicies(
      identity,
      action,
      resource
    );

    for (const policy of applicablePolicies) {
      // Evaluate policy
      const allowed = this.evaluatePolicy(
        policy,
        identity,
        action,
        resource
      );

      if (allowed) {
        this.logAccess("allowed", identity, action, resource);
        return { allowed: true, policy };
      }
    }

    this.logAccess("denied", identity, action, resource);
    return { allowed: false, reason: "No matching policy" };
  }

  evaluatePolicy(policy, identity, action, resource) {
    for (const statement of policy.statement) {
      // Check principal
      if (!this.matchesPrincipal(identity, statement.principal)) {
        continue;
      }

      // Check action
      if (!this.matchesAction(action, statement.action)) {
        continue;
      }

      // Check resource
      if (!this.matchesResource(resource, statement.resource)) {
        continue;
      }

      // Evaluate conditions
      if (statement.condition) {
        if (!this.evaluateConditions(statement.condition)) {
          continue;
        }
      }

      return statement.effect === "Allow";
    }

    return false;
  }

  evaluateConditions(conditions) {
    if (conditions.ipAddress) {
      if (!this.checkIPRange(conditions.ipAddress)) return false;
    }

    if (conditions.requestRate) {
      if (!this.checkRateLimit(conditions.requestRate)) return false;
    }

    if (conditions.timeOfDay) {
      if (!this.checkTimeRange(conditions.timeOfDay)) return false;
    }

    if (conditions.mfaPresent) {
      if (!conditions.mfaPresent) return false;
    }

    if (conditions.ssl) {
      if (!this.isSSLEnabled()) return false;
    }

    return true;
  }

  // Usage quotas
  async checkQuota(userId, modelId) {
    const quota = this.getQuota(userId, modelId);
    const used = this.getUserUsage(userId, modelId);

    if (used.count >= quota.maxRequests) {
      return { allowed: false, reason: "Request quota exceeded" };
    }

    if (used.tokens >= quota.maxTokens) {
      return { allowed: false, reason: "Token quota exceeded" };
    }

    if (used.bytes >= quota.maxDataPerMonth) {
      return { allowed: false, reason: "Data quota exceeded" };
    }

    return { allowed: true };
  }

  // Access audit
  logAccess(status, identity, action, resource) {
    this.accessLog.push({
      timestamp: new Date(),
      status,
      userId: identity.userId,
      action,
      resource,
      sourceIP: this.getClientIP(),
      userAgent: this.getUserAgent(),
    });

    // Alert on suspicious patterns
    if (this.detectSuspiciousActivity(identity)) {
      this.alertSecurityTeam(identity);
    }
  }

  detectSuspiciousActivity(identity) {
    const userLogs = this.accessLog.filter(
      l => l.userId === identity.userId
    );

    // Check for unusual access patterns
    const deniedCount = userLogs.filter(
      l => l.status === "denied"
    ).length;

    // Many failed attempts
    if (deniedCount > 10) return true;

    // Access from multiple IPs in short time
    const ips = new Set(userLogs.map(l => l.sourceIP));
    if (ips.size > 5) return true;

    // Off-hours access
    const hour = new Date().getHours();
    if ((hour < 6 || hour > 22) && deniedCount > 5) return true;

    return false;
  }

  // Generate audit report
  generateAuditReport(startDate, endDate) {
    const filtered = this.accessLog.filter(
      l => l.timestamp >= startDate && l.timestamp <= endDate
    );

    return {
      period: { start: startDate, end: endDate },
      totalAccesses: filtered.length,
      allowedAccesses: filtered.filter(l => l.status === "allowed").length,
      deniedAccesses: filtered.filter(l => l.status === "denied").length,
      uniqueUsers: new Set(filtered.map(l => l.userId)).size,
      accessByModel: this.groupBy(filtered, "resource"),
      suspiciousActivities: this.identifySuspiciousPatterns(filtered),
    };
  }
}`,
  },

  {
    id: "vulnerability-management",
    category: "Operations",
    title: "AI Model Vulnerability Management",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Identify, report, prioritize, and remediate vulnerabilities in AI models and systems.",
    tags: ["vulnerability", "patching", "remediation"],
    steps: [
      { label: "Identify Vulnerabilities", icon: "🔍", detail: "Use scanning and red-teaming to find issues." },
      { label: "Assess Severity", icon: "⚠️", detail: "Rate impact and exploitability." },
      { label: "Create CVE", icon: "📋", detail: "Register CVE for public vulnerabilities." },
      { label: "Develop Patch", icon: "🔧", detail: "Create fix or mitigation." },
      { label: "Release Update", icon: "📦", detail: "Distribute patch to users." },
      { label: "Monitor Adoption", icon: "📊", detail: "Track patch application rates." },
    ],
    code: `class VulnerabilityManagement {
  constructor() {
    this.vulnerabilities = [];
    this.patchRegistry = new Map();
    this.deploymentStatus = new Map();
  }

  // Identify and register vulnerability
  async registerVulnerability(vulnDetails) {
    const vuln = {
      id: this.generateVulnId(),
      title: vulnDetails.title,
      description: vulnDetails.description,
      discoveredDate: new Date(),
      discoverer: vulnDetails.discoverer,
      type: vulnDetails.type, // adversarial, privacy, etc.
      severity: this.assessSeverity(vulnDetails),
      affectedVersions: vulnDetails.affectedVersions,
      status: "discovered",
      timeline: [],
      cve: null,
    };

    // Timeline for responsible disclosure
    vuln.timeline.push({
      event: "discovered",
      date: new Date(),
    });

    this.vulnerabilities.push(vuln);
    return vuln;
  }

  assessSeverity(details) {
    const {
      impactScore,
      exploitability,
      affectedUsers,
      dataExposed,
    } = details;

    // CVSS-like scoring
    let score = 0;

    // Impact: 0-4 points
    if (dataExposed) score += 4;
    else if (serviceDisrupted) score += 2;

    // Exploitability: 0-3 points
    if (exploitability === "high") score += 3;
    else if (exploitability === "medium") score += 2;
    else score += 1;

    // User impact: 0-3 points
    if (affectedUsers > 1000000) score += 3;
    else if (affectedUsers > 10000) score += 2;
    else if (affectedUsers > 100) score += 1;

    const severity = score >= 8 ? "critical"
      : score >= 6 ? "high"
      : score >= 4 ? "medium"
      : "low";

    return { score: score / 10, level: severity };
  }

  // Responsible disclosure timeline
  setDisclosureTimeline(vulnId, timeline) {
    const vuln = this.vulnerabilities.find(v => v.id === vulnId);

    vuln.disclosureTimeline = {
      // Discoverer has 90 days before public disclosure
      vendorNotificationDeadline: 
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      publicDisclosureDeadline: 
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    };

    vuln.timeline.push({
      event: "disclosure_timeline_set",
      date: new Date(),
    });
  }

  // Request CVE
  async requestCVE(vulnId) {
    const vuln = this.vulnerabilities.find(v => v.id === vulnId);

    if (vuln.severity.level !== "critical" && 
        vuln.severity.level !== "high") {
      throw new Error("Only critical/high severity vuln get CVEs");
    }

    // Register with NVD
    const cveId = await this.registerWithNVD({
      description: vuln.description,
      affectedSoftware: vuln.affectedVersions,
      references: vuln.references || [],
    });

    vuln.cve = cveId;
    vuln.timeline.push({
      event: "cve_assigned",
      cveId,
      date: new Date(),
    });

    return cveId;
  }

  // Develop and deploy patch
  async developPatch(vulnId, patchDetails) {
    const vuln = this.vulnerabilities.find(v => v.id === vulnId);

    const patch = {
      id: this.generatePatchId(),
      vulnId,
      type: patchDetails.type, // full, hotfix, workaround
      description: patchDetails.description,
      code: patchDetails.code,
      testResults: null,
      status: "development",
      releaseDate: null,
    };

    // Test patch
    patch.testResults = await this.testPatch(patch);

    if (patch.testResults.passedAllTests) {
      patch.status = "ready_for_release";
    } else {
      throw new Error("Patch failed tests");
    }

    this.patchRegistry.set(patch.id, patch);
    return patch;
  }

  async testPatch(patch) {
    const results = {
      securityTests: await this.runSecurityTests(patch),
      regressionTests: await this.runRegressionTests(patch),
      performanceTests: await this.runPerformanceTests(patch),
      passedAllTests: false,
    };

    results.passedAllTests = 
      results.securityTests.passed &&
      results.regressionTests.passed &&
      results.performanceTests.impact < 5; // <5% slowdown

    return results;
  }

  async releasePatch(patchId) {
    const patch = this.patchRegistry.get(patchId);

    // Create release
    const release = {
      id: this.generateReleaseId(),
      patchId,
      releaseDate: new Date(),
      downloadUrl: await this.uploadToRegistry(patch),
      checksumSHA256: this.computeChecksum(patch),
      signedWith: this.signingKey,
      rolloutStrategy: "phased", // 5% → 25% → 100%
    };

    patch.status = "released";
    patch.releaseDate = release.releaseDate;

    // Publish security advisory
    await this.publishAdvisory(patch, release);

    return release;
  }

  // Monitor patch deployment
  async monitorDeployment(releaseId) {
    const deployment = {
      releaseId,
      startDate: new Date(),
      phases: [
        { percentage: 0.05, duration: "1 week", status: "ongoing" },
        { percentage: 0.25, duration: "1 week", status: "pending" },
        { percentage: 1.0, duration: "ongoing", status: "pending" },
      ],
      adoptionRate: 0,
      failureRate: 0,
      rollbackNeeded: false,
    };

    return deployment;
  }

  // Generate security advisory
  async publishAdvisory(patch, release) {
    const advisory = \`
SECURITY ADVISORY

Model: \${patch.vulnId}
Severity: HIGH
Release Date: \${release.releaseDate}

Description:
\${patch.description}

Affected Versions:
\${this.vulnerabilities.find(v => v.id === patch.vulnId).affectedVersions.join(", ")}

Fix:
Apply patch \${release.id} from official repository.

Verification:
sha256: \${release.checksumSHA256}

References:
https://nvd.nist.gov/vuln/detail/\${patch.cveId}
    \`;

    await this.distributeAdvisory(advisory);
  }
}`,
  },

  {
    id: "adversarial-training",
    category: "Defense",
    title: "Adversarial Training & Hardening",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Improve model robustness through adversarial training and other defensive techniques.",
    tags: ["adversarial", "robustness", "defense"],
    steps: [
      { label: "Generate Adversarial Examples", icon: "💣", detail: "Create attack examples using PGD, etc." },
      { label: "Mixed Training", icon: "🔀", detail: "Train on clean + adversarial data." },
      { label: "Measure Robustness", icon: "📊", detail: "Test against various attacks." },
      { label: "Iterative Improvement", icon: "🔄", detail: "Repeat with harder adversarial examples." },
      { label: "Trade-off Analysis", icon: "⚖️", detail: "Monitor accuracy vs robustness." },
      { label: "Deployment", icon: "🚀", detail: "Deploy hardened model to production." },
    ],
    code: `class AdversarialTrainingFramework {
  constructor(baseModel, config) {
    this.baseModel = baseModel;
    this.config = config;
    this.trainingHistory = [];
  }

  async trainAdvAct(trainingData, epochs = 10) {
    let model = this.baseModel;
    const attackGenerator = new AttackGenerator(model);

    for (let epoch = 0; epoch < epochs; epoch++) {
      const metrics = { cleanAccuracy: 0, robustAccuracy: 0 };

      for (const batch of trainingData) {
        // Generate adversarial examples for this batch
        const adversarial = await Promise.all(
          batch.images.map((img, i) =>
            attackGenerator.generatePGD(img, batch.labels[i], {
              epsilon: 0.03,
              iterations: 7,
            })
          )
        );

        // Mix clean and adversarial data
        const mixedImages = tf.concat([
          batch.images,
          tf.stack(adversarial),
        ], 0);

        const mixedLabels = tf.concat([
          batch.labels,
          batch.labels,
        ], 0);

        // Train on mixed batch
        const loss = await model.trainOnBatch(mixedImages, mixedLabels);

        // Evaluate on clean
        const cleanPreds = model.predict(batch.images);
        const cleanAcc = this.accuracy(cleanPreds, batch.labels);
        metrics.cleanAccuracy += cleanAcc;

        // Evaluate on adversarial
        const robustPreds = model.predict(mixedImages);
        const robustAcc = this.accuracy(robustPreds, mixedLabels);
        metrics.robustAccuracy += robustAcc;
      }

      metrics.cleanAccuracy /= trainingData.length;
      metrics.robustAccuracy /= trainingData.length;

      this.trainingHistory.push({
        epoch,
        ...metrics,
        timestamp: new Date(),
      });

      console.log(\`Epoch \${epoch}: Clean=\${metrics.cleanAccuracy.toFixed(3)}, Robust=\${metrics.robustAccuracy.toFixed(3)}\`);

      // Increase attack strength
      attackGenerator.increaseAttackStrength();
    }

    return model;
  }

  async evaluateRobustness(model, testData) {
    const attacks = [
      { name: "FGSM", epsilon: 0.03 },
      { name: "PGD", epsilon: 0.03 },
      { name: "CW", epsilon: 0.5 },
      { name: "AutoAttack", epsilon: 0.03 },
    ];

    const results = {};

    for (const attack of attacks) {
      const generator = new AttackGenerator(model);
      const adversarialExamples = await Promise.all(
        testData.images.map((img, i) =>
          generator.generate(img, testData.labels[i], attack)
        )
      );

      const predictions = model.predict(tf.stack(adversarialExamples));
      const accuracy = this.accuracy(predictions, testData.labels);

      results[attack.name] = accuracy;
    }

    return {
      testData: "ImageNet-100",
      results,
      worstCaseAccuracy: Math.min(...Object.values(results)),
      certified: false,
    };
  }

  // Certified defense via randomized smoothing
  async certifyRobustness(model, testData, sigma = 0.25) {
    const results = [];

    for (const sample of testData.slice(0, 100)) {
      const smoothed = await this.smoothPrediction(model, sample.image, sigma);

      results.push({
        sample: sample.id,
        certified_radius: smoothed.radius,
        prediction: smoothed.prediction,
      });
    }

    const certifiedAccuracy = results.filter(r => r.certified_radius > 0).length / results.length;

    return {
      certifiedAccuracy,
      averageRadius: results.reduce((s, r) => s + r.certified_radius, 0) / results.length,
      details: results,
    };
  }

  async smoothPrediction(model, input, sigma, samples = 100) {
    const predictions = [];

    for (let i = 0; i < samples; i++) {
      const noise = tf.randomNormal(input.shape, 0, sigma);
      const noised = input.add(noise);
      const pred = model.predict(noised);
      predictions.push(pred);
    }

    const topClass = this.getTopPrediction(predictions);
    const confidence = this.computeConfidence(predictions, topClass);
    const radius = this.computeRadius(confidence, sigma, samples);

    return { prediction: topClass, radius, confidence };
  }

  // Fine-tuning on adversarial examples
  async fineTuneOnAdversarial(model, hardExamples) {
    // Focus on examples that fool the model
    const selectedExamples = hardExamples
      .filter(ex => !model.predict(ex.image).argMax() === ex.trueLabel)
      .slice(0, 1000);

    await model.fit(
      tf.stack(selectedExamples.map(ex => ex.image)),
      tf.stack(selectedExamples.map(ex => ex.label)),
      { epochs: 5, batchSize: 32 }
    );

    return model;
  }
}`,
  },

  {
    id: "security-monitoring",
    category: "Operations",
    title: "Security Monitoring & Incident Detection",
    difficulty: "Intermediate",
    time: "~30 min",
    description:
      "Monitor AI systems for security incidents, anomalies, and attacks in real-time.",
    tags: ["monitoring", "incident-detection", "alerts"],
    steps: [
      { label: "Define Baselines", icon: "📊", detail: "Establish normal behavior metrics." },
      { label: "Collect Metrics", icon: "📡", detail: "Monitor performance, access, outputs." },
      { label: "Detect Anomalies", icon: "🚨", detail: "Identify deviations from baseline." },
      { label: "Alert Team", icon: "📢", detail: "Send alerts for suspicious activity." },
      { label: "Incident Response", icon: "🔧", detail: "Activate response playbook." },
      { label: "Post-Incident Review", icon: "📋", detail: "Analyze and improve defenses." },
    ],
    code: `class SecurityMonitoring {
  constructor(config) {
    this.metrics = new TimeSeries();
    this.baselines = new Map();
    this.alerts = [];
    this.config = config;
  }

  // Define baseline metrics
  defineBaseline(metricName, config) {
    this.baselines.set(metricName, {
      mean: config.mean,
      stddev: config.stddev,
      min: config.min,
      max: config.max,
      windowSize: config.windowSize || 3600, // 1 hour
    });
  }

  // Collect and analyze metrics
  async collectMetrics(model, request, response) {
    const metric = {
      timestamp: new Date(),
      inputHash: this.hash(request.input),
      inputSize: JSON.stringify(request.input).length,
      inputPercentile: this.getInputPercentile(request.input),
      outputConfidence: Math.max(...response.prediction),
      outputEntropy: this.entropy(response.prediction),
      latency: response.executionTime,
      memoryUsage: this.getMemoryUsage(),
      gpuUsage: this.getGPUUsage(),
    };

    this.metrics.add(metric);

    // Anomaly detection
    const anomalies = await this.detectAnomalies(metric);

    if (anomalies.length > 0) {
      this.generateAlert(metric, anomalies);
    }

    return metric;
  }

  async detectAnomalies(metric) {
    const anomalies = [];

    // Statistical anomaly detection
    for (const [name, baseline] of this.baselines) {
      if (!metric[name]) continue;

      const zScore = Math.abs(
        (metric[name] - baseline.mean) / baseline.stddev
      );

      if (zScore > 3) { // 3 sigma
        anomalies.push({
          type: "statistical",
          metric: name,
          value: metric[name],
          zScore,
          baseline: baseline.mean,
        });
      }
    }

    // Pattern-based anomaly detection
    const contextAnomalies = await this.detectContextAnomalies(metric);
    anomalies.push(...contextAnomalies);

    return anomalies;
  }

  async detectContextAnomalies(metric) {
    const anomalies = [];

    // Adversarial input detection
    if (this.isLikelyAdversarial(metric)) {
      anomalies.push({
        type: "adversarial_input",
        confidence: this.computeAdversarialScore(metric),
      });
    }

    // Extraction attack detection
    if (this.isExtractionAttack(metric)) {
      anomalies.push({
        type: "extraction_attack",
        evidence: "systematic queries",
      });
    }

    // Privilege escalation attempt
    if (this.isPossiblePrivEsc(metric)) {
      anomalies.push({
        type: "privilege_escalation",
      });
    }

    // Unusual access pattern
    if (this.isUnusualAccess(metric)) {
      anomalies.push({
        type: "unusual_access",
      });
    }

    return anomalies;
  }

  isLikelyAdversarial(metric) {
    // Check for adversarial characteristics
    const highConfidenceContrast = metric.outputConfidence > 0.95 &&
      metric.outputEntropy < 0.1; // Very confident, low uncertainty

    const unusualInput = metric.inputPercentile < 0.01 ||
      metric.inputPercentile > 0.99; // Extreme input

    return highConfidenceContrast && unusualInput;
  }

  isExtractionAttack(metric) {
    // Look for query patterns consistent with extraction
    const recentQueries = this.metrics.getRecent(3600); // Last hour

    // Many queries with diverse inputs
    const uniqueInputs = new Set(recentQueries.map(m => m.inputHash));
    const diversityRatio = uniqueInputs.size / recentQueries.length;

    // High success rate across diverse inputs
    const successfulQueries = recentQueries.filter(
      m => m.outputConfidence > 0.8
    ).length;

    return diversityRatio > 0.8 &&
      successfulQueries / recentQueries.length > 0.9;
  }

  // Alert generation
  generateAlert(metric, anomalies) {
    const severity = this.computeSeverity(anomalies);

    const alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      severity, // low, medium, high, critical
      anomalies,
      metric,
      status: "new",
      acknowledged: false,
    };

    this.alerts.push(alert);

    if (severity === "critical") {
      this.triggerIncidentResponse(alert);
    } else {
      this.notifySecurityTeam(alert);
    }

    return alert;
  }

  async triggerIncidentResponse(alert) {
    const incident = {
      id: this.generateIncidentId(),
      alert,
      createdAt: new Date(),
      status: "in_progress",
      timeline: [
        { event: "incident_created", timestamp: new Date() },
      ],
      actions: [],
    };

    // Execute response playbook
    const playbook = this.getPlaybook(alert.anomalies[0].type);

    for (const action of playbook.actions) {
      const result = await this.executeAction(action, incident);
      incident.actions.push(result);
      incident.timeline.push({
        event: action.name,
        timestamp: new Date(),
        result,
      });
    }

    return incident;
  }

  getPlaybook(anomalyType) {
    const playbooks = {
      adversarial_input: {
        actions: [
          { name: "block_input", action: () => this.blockInput() },
          { name: "log_incident", action: () => this.logIncident() },
          { name: "notify_team", action: () => this.notifySecurityTeam() },
        ],
      },
      extraction_attack: {
        actions: [
          { name: "rate_limit_user", action: () => this.rateLimitUser() },
          { name: "require_mfa", action: () => this.requireMFA() },
          { name: "open_ticket", action: () => this.openSecurityTicket() },
        ],
      },
      privilege_escalation: {
        actions: [
          { name: "revoke_access", action: () => this.revokeAccess() },
          { name: "isolate_model", action: () => this.isolateModel() },
          { name: "full_audit", action: () => this.fullSecurityAudit() },
        ],
      },
    };

    return playbooks[anomalyType] || { actions: [] };
  }

  // Generate security report
  generateSecurityReport(startDate, endDate) {
    const filtered = this.alerts.filter(
      a => a.timestamp >= startDate && a.timestamp <= endDate
    );

    return {
      period: { start: startDate, end: endDate },
      totalAlerts: filtered.length,
      criticalAlerts: filtered.filter(a => a.severity === "critical").length,
      alertsByType: this.groupBy(filtered, a => a.anomalies[0].type),
      mttr: this.computeMTTR(filtered), // Mean Time To Resolve
      trends: this.analyzeTrends(filtered),
      recommendations: this.generateRecommendations(filtered),
    };
  }
}`,
  },
];

const CATEGORIES = ["All", "Foundations", "Attacks", "Defense", "Governance", "Operations"];
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
          background: "#FDE2E4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        🔐
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: "-0.3px" }}>AI Security Cookbook</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
          Attack vectors, defenses, and security best practices for AI systems
        </p>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
        {[
          { label: "Recipes", value: AISecurity.length },
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
  const [selected, setSelected] = useState(AISecurity[0]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        background: "var(--color-background-tertiary, radial-gradient(circle at top, #0f172a, #020617);)",
        // background: "var(--color-background-tertiary, radial-gradient(circle at top, #0f172a, #020617))",
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
            recipes={AISecurity}
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
