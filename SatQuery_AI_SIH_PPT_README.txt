SATQUERY AI — SIH PPT MASTER CONTENT & DESIGN PLAN

PPT GOAL
Make the PPT explain:
PROBLEM -> GAP -> SOLUTION -> ARCHITECTURE -> MANDATORY FEATURES -> INNOVATION -> IMPLEMENTATION -> EVALUATION -> IMPACT

Keep it concise, visual, technical, and directly mapped to the problem statement.
Do not claim results, accuracy, benchmark scores, or capabilities that have not actually been implemented/tested.

==================================================
VISUAL DESIGN SYSTEM
==================================================

Theme:
- Dark aerospace / Earth-observation aesthetic
- Deep navy/black background
- White text
- Cyan/blue accents
- Optional subtle violet accent
- Satellite imagery as the main visual language
- Thin technical grid / coordinate overlays
- Minimal glassmorphism
- No excessive neon

Typography:
- Large bold slide titles
- One strong headline per slide
- Short bullets
- Highlight important technical terms
- Keep body text readable from presentation distance

Design principle:
Every slide answers ONE question.

Footer:
SATQUERY AI | Agentic Earth Observation Intelligence

Do NOT put:
- Frame counters
- Long paragraphs
- Fake statistics
- Unverified benchmark scores
- Internal chain-of-thought
- Unnecessary decorative diagrams

==================================================
SLIDE 1 — TITLE / ONE-LINE SOLUTION
==================================================

TITLE:
SATQUERY AI

SUBTITLE:
Agentic Earth Observation Intelligence

TAGLINE:
Ask the Earth. Get the Evidence.

ONE-LINE DESCRIPTION:
Natural-language satellite imagery analysis powered by an agentic system that selects specialised remote-sensing models.

VISUAL:
Large Earth/satellite image or cinematic satellite-to-Earth visual.

BOTTOM:
Team name
Team members
Institute/college
Problem Statement ID/title as required by SIH

Keep this slide minimal.

==================================================
SLIDE 2 — PROBLEM / THE GAP
==================================================

TITLE:
THE PROBLEM

HEADLINE:
Satellite imagery contains answers, but accessing them requires specialised workflows.

LEFT — CURRENT CHALLENGE:
- Existing remote-sensing AI systems are often task-specific.
- Users may need GIS/domain knowledge.
- Model and parameter selection can be difficult.
- A single optical image is not always sufficient.
- Important information may be distributed across time or sensors.

RIGHT — VISUAL:
USER QUESTION
    ↓
GIS / SENSOR KNOWLEDGE
    ↓
MODEL SELECTION
    ↓
TASK-SPECIFIC WORKFLOW
    ↓
ANSWER

BOTTOM HIGHLIGHT:
The gap: users need a simple natural-language interface that can intelligently choose the right remote-sensing workflow.

==================================================
SLIDE 3 — OUR SOLUTION
==================================================

TITLE:
OUR SOLUTION — SATQUERY AI

HEADLINE:
Ask a question. SatQuery decides how to analyse the imagery.

MAIN FLOW:
USER
  ↓
NATURAL-LANGUAGE QUERY
  ↓
SATQUERY AGENT
  ↓
TASK + INPUT UNDERSTANDING
  ↓
SPECIALIST MODELS / TOOLS
  ↓
EVIDENCE
  ↓
ANSWER

THREE INPUT MODES:

1. SINGLE IMAGE
Optical / Multispectral / SAR

2. OPTICAL + SAR
Co-registered cross-modal pair

3. BI-TEMPORAL
Same area at different times

OUTPUT:
- Text answer
- Spatial evidence
- Confidence
- Change map where applicable
- Execution summary

KEY MESSAGE:
One interface instead of multiple isolated remote-sensing applications.

==================================================
SLIDE 4 — AGENTIC ARCHITECTURE
==================================================

TITLE:
AGENTIC ARCHITECTURE

This is one of the most important technical slides.

ARCHITECTURE:

                    USER
                     |
                     v
             NATURAL LANGUAGE
                QUERY + IMAGES
                     |
                     v
        +-------------------------+
        |     SATQUERY AGENT      |
        |                         |
        | Query Understanding     |
        | Input Validation        |
        | Task Classification     |
        | Tool/Model Selection    |
        | Workflow Orchestration  |
        +------------+------------+
                     |
          +----------+-----------+
          |          |           |
          v          v           v
       SINGLE     TEMPORAL    CROSS-MODAL
       IMAGE      ANALYSIS     ANALYSIS
          |          |           |
      +---+---+      |       OPTICAL + SAR
      v   v   v      v           |
     VQA CAPTION GROUNDING   FUSION / ANALYSIS
          |          |           |
          +----------+-----------+
                     |
                     v
            EVIDENCE INTEGRATION
                     |
          +----------+----------+
          v          v          v
       ANSWER     SPATIAL    CONFIDENCE
                  EVIDENCE
                     |
                     v
              EXECUTION TRACE

Observable execution information:
- selected task
- selected model/tool
- permitted parameters
- output/evidence
- confidence

Do NOT show hidden chain-of-thought.

==================================================
SLIDE 5 — FUNCTIONAL COVERAGE
==================================================

TITLE:
FROM ONE IMAGE TO MULTI-MODAL REASONING

Use a 3-column layout.

COLUMN 1 — SINGLE IMAGE
Input:
One optical/multispectral or SAR image

Capabilities:
✓ Visual Question Answering
✓ Captioning / Scene Description
✓ Text-guided Grounding

Example:
“Describe the land-cover and major objects visible in this image.”

COLUMN 2 — BI-TEMPORAL
Input:
Two spatially corresponding images

Capabilities:
✓ Change Understanding
✓ Change Description
✓ Change-based VQA
✓ Spatial change map where masks are available

Example:
“Has the built-up area increased?”

COLUMN 3 — CROSS-MODAL
Input:
Co-registered Optical + SAR

Capabilities:
✓ Complementary information extraction
✓ Built-up analysis
✓ Water/structure analysis
✓ Cross-modal reasoning

Example:
“Use optical and SAR images together to identify built-up and water-covered regions.”

BOTTOM:
These three modes cover the mandatory input and analysis scope.

==================================================
SLIDE 6 — SPECIALIST MODEL ORCHESTRATION
==================================================

TITLE:
THE AGENT DOES NOT USE ONE MODEL FOR EVERYTHING

HEADLINE:
The query determines the workflow.

SHOW:

QUERY:
“Has the built-up area increased?”

        ↓

QUERY INTERPRETATION
Task = Change-based VQA

        ↓

INPUT CHECK
2 images
Spatially corresponding
Temporal observations

        ↓

SPECIALISTS SELECTED
✓ Change Understanding
✓ VQA
✓ Grounding

        ↓

EXECUTION

        ↓

OUTPUT
“Built-up area increased”
+ highlighted regions
+ confidence
+ execution summary

SIDE PANEL:
SPECIALIST REGISTRY
- Remote-sensing VQA
- Captioning / Scene Description
- Grounding
- Change Understanding / Change-VQA
- Optical–SAR Analysis

KEY MESSAGE:
The innovation is orchestration and routing, not simply using multiple models.

==================================================
SLIDE 7 — OPTICAL + SAR
==================================================

TITLE:
ONE IMAGE ISN'T ALWAYS ENOUGH

VISUAL:

OPTICAL                 SAR
[ satellite image ]     [ SAR image ]

             ↓
          ALIGN
             ↓
           FUSE
             ↓
     UNIFIED ANALYSIS

SHOW COMPLEMENTARY INFORMATION:

OPTICAL:
- Spectral information
- Visual/contextual information
- Vegetation / land-cover cues

SAR:
- Structural information
- Day/night acquisition
- Useful through cloud cover

JOINT RESULT:
- Buildings
- Water
- Roads
- Vegetation
- Structural patterns

EXAMPLE QUERY:
“Use the optical and SAR images together to identify built-up and water-covered regions.”

Only claim actual fusion/model implementation that the team has built.
If currently simulated for UI, label it as “demonstration”.

==================================================
SLIDE 8 — MULTI-TEMPORAL CHANGE
==================================================

TITLE:
TIME LEAVES EVIDENCE

VISUAL:
2018 — 2020 — 2022 — 2024 — 2026

Show the same geographic region evolving.

Then:

T1                     T2
[IMAGE]                [IMAGE]
        ↓
   CHANGE ANALYSIS
        ↓
  CHANGE MAP / MASK
        ↓
“BUILT-UP AREA INCREASED”

OUTPUT:
- Change description
- Change-based VQA
- Location of change
- Spatial mask/map where available

EXAMPLE:
“Has the built-up area increased, decreased, or remained unchanged?”

KEY MESSAGE:
SatQuery can reason over what changed, not just what is visible in one image.

==================================================
SLIDE 9 — EVIDENCE + EXPLAINABILITY
==================================================

TITLE:
FROM ANSWER TO EVIDENCE

LEFT:
ANSWER CARD

“Built-up area increased.”

Confidence:
94% ONLY IF THIS IS AN ACTUAL MEASURED/DEMO VALUE.
Otherwise use a generic “Confidence: available from model”.

RIGHT:
SATELLITE IMAGE

Overlay:
- Bounding boxes
- Segmentation/change masks
- Highlighted regions
- Coordinates if available

BOTTOM:
EXECUTION SUMMARY

Task:
Change-based VQA

Models/Tools:
Change Understanding
VQA
Grounding

Input:
2 temporal images

Output:
Answer + spatial evidence

KEY MESSAGE:
SatQuery connects the answer to observable spatial evidence and execution information.

==================================================
SLIDE 10 — REMOTE-SENSING ADAPTATION + DATA
==================================================

TITLE:
DOMAIN-ADAPTED REMOTE-SENSING INTELLIGENCE

FLOW:

GENERIC VISION-LANGUAGE MODEL
          ↓
REMOTE-SENSING TRAINING DATA
          ↓
FINE-TUNING / DOMAIN ADAPTATION
          ↓
REMOTE-SENSING-ADAPTED COMPONENT
          ↓
SATQUERY AGENT

DATASETS / BENCHMARKS:

BigEarthNet.txt
Purpose:
Image-text adaptation / remote-sensing representation learning

VRSBench
Purpose:
Remote-sensing vision-language evaluation

RSVQA
Purpose:
Visual Question Answering

CDVQA
Purpose:
Change-based Visual Question Answering

ISRO/SAC EVALUATION DATASET
Purpose:
Final evaluation on pre-georeferenced and co-registered Cartosat-2S optical and RISAT SAR pairs with task-specific annotations.

IMPORTANT:
Separate TRAINING/ADAPTATION data from EVALUATION benchmarks.
Do not say the system was trained on a dataset unless that is actually true.

==================================================
SLIDE 11 — EVALUATION / REQUIREMENT MAPPING
==================================================

TITLE:
DIRECTLY ALIGNED WITH THE EVALUATION CRITERIA

TABLE:

REQUIREMENT                    SATQUERY IMPLEMENTATION
----------------------------------------------------------
Single-image VQA               Remote-sensing VQA specialist
Additional single-image task   Captioning OR Grounding
Bi-temporal analysis           Change understanding / Change-VQA
Optical–SAR analysis           Cross-modal analysis module
Agentic orchestration          Query-driven tool/model routing
Input validation               Format/modality/metadata checks
Evidence                       Bounding boxes / masks / visual evidence
Confidence                      Model/workflow confidence
Execution summary              Task + model/tool + parameters + outputs
Remote-sensing adaptation      Fine-tuned/domain-adapted component

BOTTOM:
Evaluation sources:
BigEarthNet / VRSBench / RSVQA / CDVQA / ISRO-SAC dataset as applicable.

Do not include unsupported numerical performance claims.

==================================================
SLIDE 12 — INNOVATION + USE CASES + IMPACT
==================================================

TITLE:
WHY SATQUERY AI?

5 INNOVATION BLOCKS:

1. QUERY-DRIVEN
Natural language replaces complex workflow selection.

2. AGENTIC
Automatically routes queries to specialist remote-sensing tools/models.

3. MULTI-MODAL
Combines complementary optical and SAR information.

4. TEMPORAL
Understands change across observations over time.

5. EVIDENCE-GROUNDED
Returns spatial evidence, confidence, and execution trace.

USE CASES:
- Disaster management
- Agriculture monitoring
- Urban planning
- Forest monitoring
- Water-resource assessment
- Infrastructure mapping
- Environmental analysis

FINAL IMPACT LINE:
“Making specialised Earth-observation intelligence accessible through natural language.”

==================================================
OPTIONAL FINAL SLIDE — LIVE DEMO
==================================================

TITLE:
ASK THE EARTH.

INPUT:
Two satellite images

QUERY:
“Has the built-up area increased, and where?”

AGENT:
Task → Change-based VQA
Models → Change + VQA + Grounding

RESULT:
Answer
+
Highlighted regions
+
Confidence
+
Execution trace

QR CODE:
Live demo / repository if permitted.

==================================================
DETAILED ARCHITECTURE — FOR THE TECHNICAL SLIDE
==================================================

                    +--------------------+
                    |       USER         |
                    | Query + Image(s)   |
                    +---------+----------+
                              |
                              v
                    +--------------------+
                    |  INPUT VALIDATOR   |
                    | format / metadata  |
                    | modality / pairing |
                    +---------+----------+
                              |
                              v
                    +--------------------+
                    | SATQUERY AGENT     |
                    | Query Interpreter  |
                    | Task Router        |
                    | Workflow Planner   |
                    +---------+----------+
                              |
             +----------------+-----------------+
             |                |                 |
             v                v                 v
       +----------+     +------------+   +--------------+
       | SINGLE   |     | BI-TEMPORAL|   | CROSS-MODAL  |
       | IMAGE    |     | ANALYSIS   |   | OPTICAL+SAR  |
       +----+-----+     +------+-----+   +------+-------+
            |                  |                |
      +-----+-----+       +----+----+      +----+-----+
      v     v     v       v         v      v          v
     VQA Caption Ground  Change   Change  Alignment  Fusion
         ing             Detect    VQA               /Analysis
      |              |       |       |        |          |
      +--------------+-------+-------+--------+----------+
                              |
                              v
                    +--------------------+
                    | EVIDENCE INTEGRATOR|
                    | Answer + Spatial   |
                    | Evidence + Score   |
                    +---------+----------+
                              |
                              v
                    +--------------------+
                    | USER-FACING RESULT |
                    | Answer             |
                    | Evidence           |
                    | Confidence         |
                    | Execution Summary  |
                    +--------------------+

==================================================
WEBSITE ↔ PPT CONSISTENCY
==================================================

The website should visually demonstrate the same story:

1. SPACE / EARTH
2. NATURAL-LANGUAGE QUERY
3. SATQUERY AGENT
4. SPECIALIST MODEL SELECTION
5. OPTICAL + SAR
6. TIME / CHANGE
7. SPATIAL EVIDENCE
8. FINAL ANSWER

The website becomes a visual demonstration of the PPT architecture.

==================================================
DEMO SCRIPT
==================================================

Use one strong scenario instead of showing every feature randomly.

STEP 1:
Upload two spatially corresponding images.

STEP 2:
Ask:
“Has the built-up area increased, and where?”

STEP 3:
Show agent:
Task = Change-based VQA

STEP 4:
Show selected specialists:
Change Understanding
VQA
Grounding

STEP 5:
Run analysis.

STEP 6:
Show:
“Built-up area increased.”

STEP 7:
Show highlighted changed regions.

STEP 8:
Open execution summary.

STEP 9:
Briefly demonstrate optical + SAR with a second query.

==================================================
PPT DESIGN RULES
==================================================

Suggested sizes:
Title: 32–44 pt
Main headline: 24–32 pt
Body: 16–22 pt
Diagram labels: 14–18 pt

Rule:
No slide should contain more than 5–7 primary bullets.

Use approximately:
60–70% visuals/diagrams
30–40% text

Prefer:
3 words + diagram
over:
3 paragraphs + tiny image

Every slide should have one highlighted takeaway.

==================================================
KEY PHRASES TO USE CONSISTENTLY
==================================================

“Natural-language remote-sensing analysis”

“Agentic model/tool orchestration”

“Remote-sensing-adapted vision-language component”

“Single-image VQA”

“Text-guided grounding / captioning”

“Bi-temporal change understanding”

“Optical–SAR cross-modal analysis”

“Evidence-grounded response”

“Observable execution trace”

“Input validation”

“Confidence information”

==================================================
FINAL ONE-LINE PITCH
==================================================

“SatQuery AI lets users ask natural-language questions about satellite imagery and automatically selects specialised remote-sensing models to analyse single images, optical–SAR pairs, and temporal observations while returning evidence-grounded answers.”

==================================================
FINAL PPT CHECKLIST
==================================================

[ ] Problem clearly stated
[ ] Solution directly addresses problem
[ ] Agentic orchestration clearly shown
[ ] Architecture diagram understandable
[ ] Single-image VQA shown
[ ] Captioning OR grounding shown
[ ] Bi-temporal change analysis shown
[ ] Optical + SAR analysis shown
[ ] Remote-sensing adaptation mentioned
[ ] BigEarthNet.txt correctly positioned
[ ] VRSBench / RSVQA / CDVQA correctly positioned as evaluation resources where applicable
[ ] ISRO/SAC evaluation mentioned
[ ] Input validation shown
[ ] Evidence/visual output shown
[ ] Confidence shown or described accurately
[ ] Execution summary shown
[ ] No fake accuracy/benchmark scores
[ ] No unsupported claims
[ ] Demo matches architecture
[ ] Website and PPT tell the same story
[ ] Text readable from presentation distance
[ ] No frame counter
[ ] No unnecessary decorative content
