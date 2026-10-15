#import "@preview/apa7-ish:0.3.0": *

// Bar graph
#import "@preview/lilaq:0.6.0" as lq
// Heat table
#let hm(content) = {
  // Heatmapping, short name to be ez to write
  let heat = 100% - 5% * int(content.text)
  table.cell(
    fill: blue.lighten(heat),
  )[
    #content
  ]
}

#show: conf.with(
  title: "A framework to elicit insights about smart city platforms that enable participatory futuring",
  subtitle: "",
  documenttype: "Research Article",
  anonymous: false,
  authors: (
    (
      name: "Carl Frisenstam", // Name of author as it should appear on the paper title page
      affiliation: "Stockholm University", // affiliation(s) of author as it should appear on the title page
      corresponding: true, // optional to mark an author as corresponding author
      email: "
carl.frisenstam@gmail.com", // optional email address, required if author is corresponding
    ),
    (
      name: "Zacharias Tyllström", // Name of author as it should appear on the paper title page
      affiliation: ("Stockholm University"), // affiliation(s) of author as it should appear on the title page
      corresponding: false, // optional to mark an author as corresponding author
      email: "zacharias.tyllstrom@gmail.com", // optional email address, required if author is corresponding
    ),
  ),
  abstract: [
    // Cities increasingly rely on digital infrastructure to facilitate planning and development, turning them into smart cities. What we see is that participation by citizens is not prominent. This study examines how BIM and GIS data can be used to improve participatory planning outcomes when integrated with modern technological platforms and tools. A structured literature review is carried out to

    Modern cities are becoming increasingly complex, requiring collaboration between government agencies, businesses, and citizens. Building Information Modeling and Geographic Information Systems can visualize and analyze city data, but their features often put high requirements on spatial and urban development literacy. Enhancing participation through interactive, accessible platforms can improve decision-making in smart city initiatives. This thesis answers which features of smart city platforms enable and hinder citizens in participatory planning by conducting a structured literature review, combining inductive qualitative content analysis and thematic analysis to create a qualitative design framework that enables the user to reflect on the design of a smart city platform for participatory planning solutions. The findings show that most solutions are restricted more by governance systems than by technological limitations.
  ],
  date: "May 16, 2026",
  keywords: [Smart cities, participatory planning, BIM, GIS],
  funding: [],
)

= Introduction
// %The introduction sets the stage for your thesis, highlighting the research problem and posing the research question.
// %In other words, it addresses the overarching ``Why is this
// %study important?'' and the specific ``What is this study to
// %achieve?'' The introduction should also provide enough
// %context to make your thesis comprehensible to your intended audience.

Participatory futuring refers to a set of approaches that support decision-making by involving non-expert stakeholders in the exploration and shaping of possible futures. In parallel, the development of smart cities since the 1990s has been driven by increasing digitization of urban systems and the use of Information and Communication Technologies (ICT) in governance. Smart city platforms represent a diverse ecosystem of digital tools for urban management, including systems that integrate Building Information Modelling (BIM) and Geographic Information Systems (GIS). However, the integration and accessibility of BIM-GIS data remain constrained by technical, organizational, and usability barriers.

This thesis focuses on the participatory dimensions of smart city planning rather than the development of a fully functional BIM-GIS platform. It investigates how existing smart city and BIM-GIS systems support or hinder citizen participation. The study is guided by three research questions addressing enabling and constraining features of participatory planning systems, the influence of top-down planning approaches, and how BIM-GIS technologies can be used to improve participatory outcomes.

A systematic literature review was conducted, combining inductive qualitative content analysis (QCA) for structured data fields and thematic analysis for free-text data. QCA was applied to categories such as solution typology, interaction levels, stakeholders, governance models, Arnstein’s ladder positions, and stages of planning. Thematic analysis was used to examine features that enable or hinder participatory planning.

The findings show that most participatory planning solutions are used for generating and evaluating alternatives and are characterized as complex interactive systems modelling future urban scenarios. Results further indicate that participatory planning efforts are constrained more by governance structures than by technological limitations. Building on these insights, the study develops a qualitative design framework for evaluating participatory planning platforms and identifying gaps in participation-oriented design.

// % The background information in your thesis frames your research, offering context and rationale. It typically includes an introduction to your topic, a discussion of key concepts of your study, and a literature review to highlight previous research. This information helps readers comprehend the importance of your study and how it integrates into existing knowledge. It also prepares them for the detailed analysis, findings, and conclusions that follow. 

// % When following the IMRAD structure for a thesis, there are often two chapters dedicated to the introduction part. In the first chapter, the research problem and the research question are the centrepieces, as they provide the foundation for the rest of the thesis. Thus, only a brief background is given in this chapter. But in the second chapter, it is possible to offer a much deeper background.

== Participatory futuring
Participatory futuring can be seen as a set of approaches that can help decision-making by involving non-expert stakeholders @BARENDREGT2024103346. #cite(<AKAVARAPU2025103670>, form: "prose") identified several different interdependent dimensions of governance of participatory futures. They found four nested dimensions of capacities that interact between each nesting:

- *Prescriptive* - Governance structures ability to mobilize resources, foster collaboration, and adapt policies to changing environments. These capacities require forward-looking policies that can adapt over time.
- *Systemic* - Institutions internal structures and participatory cultures. These capacities foster collaboration, resource management and ensure continuity in participatory projects. These capacities require careful nurturing of inclusivity and structured decision-making.
- *Experiential* - Involves the engagement and skills of professionals and practitioners ability to have foresight and strategic thinking as well as engage collaboratively. These capacities depend on individuals cognitive beliefs, experience with futuring, access to knowledge, and ability to sustain discussions with various stakeholders.
- *Practice/Design-oriented* - Practical mechanisms that embed participatory practices such as strategic actor selection, building capacities of citizens, engaging the public, and reflexive feedback mechanisms.

They further identified that participants are not only central to participatory futures by way of participation but also as bearers of capacities that enable, shape, execute, and govern participatory futuring. They noted that the success of participatory futuring relied mostly on the participants knowledge and experience, rather than on which backgrounds the participants had. #cite(<AKAVARAPU2025103670>, form: "prose") states that ''Participation is inherently political, and power asymmetries can constrain or enable actors' capacity to engage meaningfully in governance processes.'' This claim is supported by literature on smart city initiatives. They show that smart city platforms risk prioritizing meeting the needs of a majority #cite(<EBEGUZGU2026107003>) or putting efficiency over equity #cite(<ZHAO2025101198>). These systemic failings highlight the importance of equitable citizen participation in participatory futuring and also the importance of structuring decision-making and ensuring inclusivity.

#cite(<Arnstein01071969>, form: "prose") introduced the ladder of citizen participation to allow users to determine citizens' power in making decisions in urban planning. This enables users to rank the level of citizen participation between different smart city platforms. However, while Arnstein's ladder enables mapping which rung a group of citizens gets to participate at, it does not critically analyze the constituents of the group or the overall framing and orientation of the citizen participation @BARENDREGT2024103346.

== What makes a city smart?
The concept of the smart city emerged some time in the 1990s as city operations grew to be more digitized over time. Many definitions of what makes a city "smart" have existed and continue to exist in parallel. in 2011 #cite((<caragliu2011smart>), form: "prose") provided an operational definition of the smart city based on six axes that could be used to rank the smartness of European cities. They summarized their findings as such:

#set quote(block: true)
#quote(attribution: [#cite((<caragliu2011smart>), form: "prose")])[
    ''We believe a city to be smart when investments in human and social capital and traditional (transport) and modern (ICT) communication infrastructure fuel sustainable economic growth and a high quality of life, with a wise management of natural resources, through participatory governance.''
  ]

Five years later, the International Communications Union (ITU) expanded on this idea by presenting the concept of smart sustainable cities (SSC) in their recommendation Y.4903/L.1603 (10/2016) #cite(<itu_y4900_2016>). This document was later superseded by Y.4903 (03/2022), but the ITU's definition of an SSC remained the same:

#set quote(block: true)
#quote(attribution: [#cite((<itu_y4900_2022>), form: "prose")])[
    ''A smart sustainable city is an innovative city that uses information and communication 
    technologies (ICTs) and other means to improve quality of life, efficiency of urban operation 
    and services, and competitiveness, while ensuring that it meets the needs of present and future 
    generations with respect to economic, social, environmental as well as cultural aspects.''
  ]
//Kanske vill fokusera mindra på KPI:er, fokusera mer på vad som pågår i metod. speciellt denna biten "This thesis uses the SSC KPIs as a framework for evaluating how effectively BIM-GIS platforms communicate the ''smartness'' of a city to citizens, planners and business stakeholders."
The ITU also provided key performance indicators (KPIs) to assess how well SSCs meet the United Nations (UN) sustainable development goals (SDGs). The KPIs are divided into three dimensions: ''economics,'' ''environment,'' and ''society and culture.'' These KPIs move the focus away from which technologies are used and move it to focus on outcomes. By using the KPIs, it's possible to measure, compare, and communicate how smart cities really are, and thus evaluate the effectiveness of a BIM-GIS platform. The SSC KPIs break down the complex concept of SSCs into measurable and comparable indicators. By linking to the SDGs, these KPIs provide a shared language for non-technical stakeholders to communicate their priorities, interests and needs.

However, it has been noted that there exists bias toward reporting positive contributions of SDGs rather than trade-offs @SHARIFI2024104659. Potential trade-offs include gentrification and uneven distribution of smart solutions as well as violations of privacy. Additionally, there is a lack of research on how to intuitively represent these indicators, which leads to challenges in knowledge sharing @Adwan2025. Studies in smart city planning, such as the relocation of Kiruna, also show that SSC related rhetoric does not necessarily translate into achieving sustainable outcomes, highlighting the need for concrete indicators to assess how well SSCs meet SDGs, but also the need for prescriptive and systemic capabilities that ensure execution #cite(<Rizzo02012024>). 

== Smart city platforms
// https://www.sciencedirect.com/science/article/pii/S2199853125002161
Smart city platforms are a diverse selection of digital platforms that generally facilitate city governance using ICT. #cite(<NOENNIG20221462>, form: "prose") created a framework for summarizing the basic design features and application potentials for a smart city platform. The framework defines and uses the concept of solution typology, i.e., viewer, analyzer, finder, or planner, together with the concept of level of interaction, i.e., monitor, dashboard, or cockpit, in order to classify solutions. Such a framework helps when comparing different solutions, as it frames the discussion around typologies and levels of interaction rather than specific technological components.

Because urban developments are often made up of complex processes and the saliency of stakeholders may vary over time, it is important to achieve clarity in when certain stakeholders are expected to be involved in planning processes. In an article where #cite(<kahachi-2025>, form: "prose") interviewed 17 experts in city planning, they defined five phases of planning: (1) Data Collection, (2) Data Analysis, (3) Generating and Evaluating Alternatives, (4) Enabling and Enforcing Urban Change, and (5) Monitoring and Control. These can be used to expand on the framework provided by #cite(<NOENNIG20221462>, form: "prose") in order to answer the question of which stakeholders are involved in using a smart city platform during urban development.

It could be argued that a smart city is not just a digital representation of the assets of the city but also the people and the social dynamics that exist in a smart city. The International Electrotechnical Commission (IEC) describes this concept with the term ''digital triplet'' #cite(<IEC2021_CIM_UDT>). Smart city platforms integrating features that capture social dynamics could, therefore, be important enablers for building experiential and practice-oriented capabilities and improving participatory outcomes.

== BIM-GIS platforms
BIM-GIS platforms combine ICT with Building information modeling (BIM) and geographic information systems (GIS). BIM is a digital process to model rich information about the built environment, as well as the processes that are required to realize the model in the natural world. It may serve as a common knowledge resource about a built object and thus, enable digital coordination between stakeholders #cite(<PETOJEVIC202599>). GIS enables the integration and analysis of data in a broader sense, providing context about the surrounding geology, infrastructure, environment, and demographics #cite(<ramasubramanian2023gis>). BIM-GIS platforms can be integrated with smart city platforms to enable users to visualize, query, analyze, and plan urban development in a more immersive and fine-grained manner as compared to traditional GIS. BIM-GIS platforms are often implemented by a wide range of technologies that fulfill different and sometimes overlapping concerns. The IEC describes a four-layer architectural model that makes up the core components of a BIM-GIS platform #cite(<IEC2021_CIM_UDT>) and can be seen in @layers. Combining these layers into a single BIM-GIS platform promises richer analysis and visualization by combining micro-level built environment data with the macro-level natural environment. However, in practice, the availability of usable BIM-GIS platforms is limited due to the underlying data being hard to come by.

#figure(
  [
    #table(
      columns: 3,
      align: left,
      toprule, // separate table from other content
      table.header([*Layer*],[*Description*],[*Example technologies*]),
      midrule, // separation between table header and body
      [        
        *Infrastructure layer*
      ],
      [        
        This layer contains computing and storage resources as well as networking and backup systems.
      ],
      [
        - OpenShift
        - Rancher
        - Amazon Web Services
        - Google Cloud Platform
        - Azure
      ],
      [
        *Data layer*
      ],
      [        
        This layer contains a wide array of data storage and query solutions for the various data format standards used. Standardized data formats are instrumental for interoperability at this layer.
      ],
      [
        - PostGIS
        - Apache Sedona
        - 3DCityDB
        - Apache Cassandra
        - Industrial Foundation Classes (IFC)
        - CityGML/CityJSON
        - GeoJSON
      ],
      [
        *Platform layer*
      ],
      [        
        The platform layer is where data is organized and merged into usable data assets. This is also where new data sources are integrated and where data governance is managed.
      ],
      [
        - Apache Flink
        - Apache Kafka
        - GeoServer
        - MapServer
        - Cesium
        - Giro 3D
        - Unreal
        - Godot
      ],
      [
        *Application layer*
      ],
      [        
        The application layer faces the end-user. Functionality is often exposed via specialized human-computer interfaces.
      ],
      [
        - Piero 3D
        - StreetComplete
        - FixMyStreet
      ],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The typical layers of a BIM-GIS platform.]
) <layers>

=== Challenges in data accessibility and usability
// %
// % - https://www.scopus.com/pages/publications/85211758870?origin=resultslist
// %
Accessing and integrating BIM-GIS data involves several barriers. Datasets are often fragmented across many sources; interpreting and integrating BIM-GIS data requires technical expertise and BIM-GIS platforms are costly to build and are seldom openly accessible. Proprietary data owned by private actors can be difficult to access due to missing organizational agreements and collaborations #cite(<Jiayi2025>).

BIM data require manual work by Architecture, Engineering, Construction or Operations (AECO) professionals to produce and, therefore, generally have a very high margin cost to produce. This leads to stronger incentives to not share BIM data without monetary compensation and in turn makes non-technical stakeholders dependent on AECO professionals to get access to BIM models. Work is being done to reduce this, but BIM data are so far still limited in availability #cite(<liu2025dataset>). Even when using shortcuts such as laser scanning combined with AI algorithms to generate BIM models, the process still demands significant preparation and post-processing #cite(<ZBIROVSKY2025106303>). By giving access to such data to non-technical stakeholders, such as citizens and organizations removed from city planning. Viewpoints that have previously not been accessible to AECO professionals could provide valuable data.

In addition to the high cost of producing high-quality BIM data, sharing the data opens up questions regarding intellectual property (IP) and legal responsibilities of stakeholders. Consider the following scenario: ''BIM modeling allows the design–build team to improve on the project’s potential aesthetics, but what happens when those projections do not meet expectations?'' and ''What happens when a BIM model is based on or includes faulty information provided by specialty equipment vendors?'' #cite(<KUBBA2017227>). To enable data availability, there should be some sort of guarantee that the data is valid.
 
GIS datasets are often fragmented or proprietary, and most existing platforms remain closed-source. Although the situation is improving through initiatives such as INSPIRE #cite(<inspire2007>) and UNIM-IGF #cite(<un_igif2020>), the sources remain technical in nature and are, therefore, not easily accessible to people outside AECO professions.

// %
// % -- Polska kommuner ahr folk som jobbar med GIS som inte kan få GIS att funka bra
// % -- https://www.sciencedirect.com/science/article/pii/S1877050925034192
// %

== Available smart city platforms
Publicly available smart city platforms and applications can be grouped into three categories. This categorization highlights the current imbalance between accessibility and functionality in BIM-GIS platforms, where publicly available systems tend to lack detailed BIM integration, while more advanced systems are inaccessible. This scarcity of publicly accessible BIM-GIS platforms is in itself a significant finding that highlights the gap between technological capabilities and their availability for citizen engagement. The categories are:

=== Publicly accessible platforms with limited BIM-GIS integration
These include platforms that are already populated with city data, such as the Lancaster City Information Model (LCIM) #cite(<Cureton2019>), the map of 3D Digital Calgary #cite(<Calgary3D2022>), and the 3D representation of Helsinki #cite(<helsinki3d2023>), which provide interactive 3D environments with LOD2 building representations and domain-specific analyses (e.g. solar potential).

=== Publicly accessible platforms with BIM-GIS integration
These include platforms such as Piero 3D, which demonstrate integration of BIM and GIS by rendering BIM data at LOD4 in a GIS map context. These platforms are often more like building blocks that require the user to bring their own data or have minimal working examples to showcase capabilities.

=== Publicly inaccessible or conceptual platforms
These include demonstrations of BIM-GIS platforms presented through videos or documentation, but without public access to the platform itself, i.e. Virtuella Göteborg #cite(<VirtuellaGoteborg2026>). While they illustrate the potential capabilities of BIM-GIS integration, their lack of accessibility prevents direct evaluation.

\
Because of the limitations of the current BIM-GIS platform ecosystem, this thesis focus is not to build a fully functional BIM-GIS platform. Instead, it focuses on the participatory aspects of smart city planning. By employing systematic literature review methodology as described in the methods section of this study, we will be able to identify what factors enable and hinder citizen participation and identify gaps within the existing body of research. From this insight we have developed a design framework that can be used for evaluation of existing tools. This is useful because it highlights the lack of participatory enabling features and functions.

// % Utveckla mer vilka HCI/UX principer/frameworks som kan vara relevant att kolla på i förhållande till den icke tekniska användaren

// %
// % -- zache - https://www.sciencedirect.com/science/chapter/edited-volume/pii/B9780128191309000437
// %
// % -- zache - trillade över denna som passar oss bra: https://www.sciencedirect.com/science/article/pii/S1569843225003930
// %

= Method <method>
// %The method part of your thesis addresses the how question, “How did you carry out your study?”. It tells your
// %reader about your choice of research strategy, data collection method and data analysis method, and how you applied these. This part should be thorough enough to allow
// %another researcher to replicate your study.

== Structured literature review
By conducting a structured literature review (SLR) #cite(<CARRERARIVERA2022101895>) we attempted to establish a solid foundation for our research by analyzing previous attempts to make smart city planning more aligned with participatory planning (PP) approaches. This process enabled us to build on existing literature and address shortcomings and gaps in current approaches. It was important for the review to capture as wide as possible a subset of available data. By conducting an SLR, we could minimize the risk of gravitating towards sources that confirm prior assumptions. The SLR will also improve reproducibility of the study since every step is well documented. The SLR was planned and conducted using the online tool Parsifal #cite(<vitorfs2026parsifal>). We started by defining the protocol of our SLR by defining Population, Intervention, Comparison, Outcome, and Context (PICOC) criteria; our research questions (RQ); our sources of information, screening criteria, and quality assessment procedure; and lastly our extraction form.

=== PICOC
The PICOC criteria  break down the SLR objectives into searchable keywords and help formulate research questions. The PICOC criteria used for this study can be seen in @picoc.

#figure(
  [
    #table(
      columns: 3,
      align: left,
      toprule, // separate table from other content
      table.header([*Criteria*],[*Description*],[*Keyword*]),
      midrule, // separation between table header and body
      [*Population*],[Can be a specific role, an application area, or an industry domain.],[Smart city],
      [*Intervention*],[The methodology, tool, or technology that addresses a specific issue.],[User experience],
      [*Comparison*],[The methodology, tool, or technology in which the Intervention is being compared (if appropriate).],[Not applied],
      [*Outcome*],[Factors of importance to practitioners and/or the results that Intervention could produce.],[Participatory planning],
      [*Context*],[The context in which the comparison takes place. Some systematic reviews might choose to exclude this element.],[Not applied],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The chosen PICOC criteria.]
) <picoc>

=== Research questions
From the PICOC we then formulated the following research questions:

- ''What features of smart city platforms enable or hinder effective participatory planning by citizens?''
- ''How does top-down planning shape planning processes compared to participatory planning?''
- ''How can BIM-GIS be applied to design or adapt smart city platforms to improve participatory planning outcomes?''

=== Search queries and sources
The sources for the search were ACM Digital Library, IEEE Digital Library, science\@Direct and Scopus. The search queries used can be seen in @search-queries.

#figure(
  [
    #table(
      columns: 1,
      align: left,
      toprule, // separate table from other content
      table.header([*Queries*]),
      midrule, // separation between table header and body
      [        
        `("Smart city") AND ("User experience") AND ("Participatory planning")`
      ],
      [
      `( ("Smart city") OR ("Urban development") ) AND ( ("Co-design") OR ("Public participation") OR  ("User engagement") ) AND ( ("BIM") AND ("GIS") )`
      ],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The search queries used for the searches]
) <search-queries>

=== Inclusion and exclusion criteria
The inclusion and exclusion criteria used can be seen in @inclusion-exclusion.

#figure(
  [
    #table(
      columns: 3,
      align: left,
      toprule, // separate table from other content
      table.header([*Criteria*],[*Inclusion*],[*Exclusion*]),
      midrule, // separation between table header and body
      [*Period*],[x >= 2020],[x < 2020],
      [*Language*],[English],[Other],
      [*Literature type*],[Article],[Reports, policy literature, working papers, newsletters, government documents, speeches, videos],
      [*Source type*],[Articles from conferences, journals and books],[Other],
      [*Source impact*],[Not used],[Not used],
      [*Accessibility*],[Accessible to research group],[Other],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The used criteria for inclusion/exclusion.]
) <inclusion-exclusion>

=== Quality assessment procedure
The questions used to evaluate the quality of each selected study can be seen in @assesment-questions. The answers were weighted according to @answers with a max score of 6 and a cutoff score below or equal to 3.5.

#figure(
  [
    #table(
      columns: 1,
      align: left,
      toprule, // separate table from other content
      table.header([*Questions*]),
      midrule, // separation between table header and body
      [Does the study explicitly discuss smart city platforms, digital twins, or urban digital systems used for planning or decision-making?],
      [Does the study examine citizen participation, co-design, or public involvement in planning processes?],
      [Does the study identify or evaluate specific features of digital platforms that enable or hinder participation?],
      [Does the study distinguish or compare top-down vs participatory planning structures, or discuss how decision-making authority is distributed?],
      [Does the study involve BIM, GIS, or their integration (including digital twins combining both) in a planning or smart city context?],
      [Does the study provide practical implications, frameworks, or system design insights applicable to urban planning or smart city development?],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The questions of the quality assessment check
  list.]
) <assesment-questions>

#figure(
  [
    #table(
      columns: 2,
      align: left,
      toprule, // separate table from other content
      table.header([*Answer*],[*Weight*]),
      midrule, // separation between table header and body
      [Yes],[1.0],
      [Partially],[0.5],
      [No],[0.0],
      bottomrule // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [Answer types and their weights.]
) <answers>

=== Data extraction
A data extraction form was created to facilitate accurate and consistent data extraction. The "stakeholders involved" field defines which stakeholders the solution of the evaluated study was aimed at. The "governance model" field defines which type of governance model was used in the solution in the evaluated study. We used multiple frameworks as the basis for the rest of our data extraction fields. We used the solution typologies and levels of interaction described by #cite(<NOENNIG20221462>, form: "prose") to address the socio-spatial complexities of urban systems. We re-used the terminology used by #cite(<kahachi-2025>) to categorize the phases of planning. We used the ladder of participation to assess the level of participation of citizens #cite(<Arnstein01071969>). To be able to qualitatively identify features that hinder or enable PP, we added fields that allowed us to later perform analysis on the snippets of extracted text to see if there were underlying patterns. The resulting data extraction form can be seen in @data-extraction-form.

#show figure: set block(breakable: true) // Fixar multi-page-table, se: https://typst.app/docs/guides/tables/#table-across-pages
#figure(
  [
    #table(
      columns: (2fr, 1.5fr, 3fr),
      align: left,

      stroke: none,
      inset: 8pt,

      toprule,

      table.header(
        [*Field*],
        [*Type*],
        [*Values*]
      ),

      midrule,

      [*Solution typology*],
      [Select Many Field],
      [
      - Analyzer  
      - Finder  
      - Planner  
      - Viewer
      - Other  
      ],

      [*Interaction levels*],
      [Select Many Field],
      [
      - Cockpit  
      - Dashboard  
      - Monitor  
      - Other
      ],

      [*Stakeholders involved*],
      [Select Many Field],
      [
      - Architecture  
      - Business  
      - Citizenry  
      - Construction  
      - Engineering  
      - Operations  
      - Public authorities
      - Not specified  
      ],

      [*Features that enable PP*],
      [String Field],
      [n/a],

      [*Features that hinder PP*],
      [String Field],
      [n/a],

      [*Governance model*],
      [Select One Field],
      [
      - Bottom-up  
      - Hybrid / Middle-out  
      - Top-down
      - Not applicable  
      ],

      [*Arnstein's ladder step*],
      [Select One Field],
      [
      - 1. Citizen control  
      - 2. Delegated power  
      - 3. Partnership  
      - 4. Placation  
      - 5. Consultation  
      - 6. Informing  
      - 7. Educating  
      - 8. Manipulating  
      - Not applicable
      ],

      [*Stage of planning*],
      [Select Many Field],
      [
      - Phase 1: Data Collection  
      - Phase 2: Data Analysis  
      - Phase 3: Generating and Evaluating Alternatives  
      - Phase 4: Enabling and Enforcing Urban Change  
      - Phase 5: Monitoring and Control
      - Not specified  
      ],

      bottomrule
    )
  ],
  caption: [Data extraction form used for the systematic literature review.]
) <data-extraction-form>
#show figure: set block(breakable: false)

== Data analysis method
// QCA: https://nsuworks.nova.edu/tqr/vol30/iss9/1/
Inductive qualitative content analysis (QCA) #cite(<Bohm_Sundqvist_2025>) is a method of analyzing and interpreting the content of textual data to extract generalizing patterns from observations. QCA was used for fields with predefined choices or codes, i.e., ''Solution typology,'' ''Interaction levels,'' ''Stakeholders involved,'' ''Governance model,'' ''Arnstein's ladder step,'' and ''Stage of planning.'' This methodology is fitting in this case because it lets us use, for example, the frequency of answers to identify patterns for analysis.

// Thematisk analys: https://www.tandfonline.com/doi/abs/10.1191/1478088706qp063oa
Thematic analysis #cite(<Braun01012006>) was used on the fields with free text, i.e., ''Features that enable PP,'' and ''Features that hinder PP.'' This combination allowed us to compare cases using previously defined frameworks while also allowing us to extract insights from potentially diverse solutions.

= Results
// In the Results part of the thesis, you objectively present the results of your study without interpreting them or discussing their wider implications. You answer the research question by presenting your quantitative or qualitative analysis outcomes. And you convey your data and
// other results through text, tables, figures, and other visual means.

In this section we report the results of conducting the SLR described in our method. We then present our findings from analyzing the data according to our data analysis method on the data that was extracted during the SLR.

== Search
@results-search shows the number of studies imported to Parsifal and their sources.

#figure(
  [
    #table(
      columns: 2,
      align: left,
      toprule, // separate table from other content
      table.header([*Source*],[*Imported studies*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända (2 MDPI, 1 Science@Direct)
      [ACM Digital Library],[1],
      [IEEE Digital Library],[4],
      [Science\@Direct],[2],
      [Scopus],[42],
      bottomrule, // separation after the last row
      table.footer[_Total_][_49_],
      bottomrule, // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [Imported studies.]
) <results-search>

== Screening
The studies were then de-duplicated, screened according to our inclusion/exclusion criteria, checked if the abstract was relevant for our research questions and finally thoroughly assessed against our quality assessment checklist:

#figure(
  [
    #table(
      columns: 2,
      align: left,
      toprule, // separate table from other content
      table.header([*Source*],[*Imported studies*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända, så en duplicerad och två rejected tas bort
      [Duplicates],[6],
      [Rejected],[18],
      [Accepted],[26],
      [Quality gated],[14],
      bottomrule, // separation after the last row
      table.footer[_Total_][_12_],
      bottomrule, // separation after the last row
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The screening process.]
) <results-study-selection>

== Data extraction
Data was then extracted into the data extraction form. @table-heatmap shows the data mapped according to the matrix shown by #cite(<NOENNIG20221462>, form: "prose"). Figure 1, 2, 3 and 4 presents the result distribution of the following fields respectively: "stakeholders involved", "governance model", "Arnsteins ladder step" and "stage of planning"

We performed a thematic analysis on the extracted data fields ''Features that enable PP'' and ''Features that hinder PP''. Their free-text nature makes them cumbersome to display and the raw answers are, therefore, not included in this study. We used thematic analysis to analyze these fields, a summary of the discovered themes can be seen in @results-thematic-analysis.

#figure(
  [
    #table(
      columns: 5,
      align: left,
      toprule, // separate table from other content
      table.header([],[*Other*],[*Monitor*],[*Dashboard*],[*Cockpit*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända, så en duplicerad och två rejected tas bort
      [*Viewer*],hm[0],hm[0],hm[2],hm([6]),
      [*Finder*],hm[0],hm[0],hm[0],hm[2],
      [*Analyzer*],hm[0],hm[0],hm[1],hm[4],
      [*Planner*],hm[0],hm[0],hm[2],hm[10],
      [*Other*],hm[1],hm[0],hm[0],hm([1]),
      bottomrule, // separation after the last row
    )
    // tablenote goes after the #table
    #tablenote([Solutions can span multiple categories.])
  ],
  // caption is part of the #figure
  caption: [Heat map of the interaction levels and solution topologies.]
) <table-heatmap>

#figure(
  [
  #lq.diagram(
      yaxis: (
        ticks: ("Not specified", "Architecture", "Business", "Citizenry", "Construction", "Engineering", "Operations", "Public authorities")
      .enumerate(),
        subticks: none
      ),
      lq.hbar(
        (0, 6, 2, 12, 1, 1, 1, 11),
        range(8),
      )
    )
  ],
  // caption is part of the #figure
  caption: [Distribution of stakeholders involved in using the solution.]
) <bar-stakeholders>

#figure([
    #lq.diagram(
      yaxis: (
        ticks: ("Not applicable", "Bottom-up", "Hybrid / Middle-out", "Top-down")
      .enumerate(),
        subticks: none
      ),
      lq.hbar(
        (2, 0, 10, 0),
        range(4),
      )
    )
  ],
  // caption is part of the #figure
  caption: [Distribution of governance models used by solutions.]
) <bar-governance>

#figure(
  [
    #lq.diagram(
      yaxis: (
        ticks: ("Not applicable", "8. Manipulating", "7. Educating", "6. Informing", "5. Consultation", "4. Placation", "3. Partnership", "2. Delegated power", "1. Citizen control")
      .enumerate(),
        subticks: none
      ),
      lq.hbar(
        (4, 0, 0, 0, 2, 8, 0, 0, 0),
        range(9),
      )
    )
  ],
  // caption is part of the #figure
  caption: [Distribution of levels of participation.]
) <bar-arnstein>

#figure(
  [
    #lq.diagram(
      yaxis: (
        ticks: ("Not specified", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5")
      .enumerate(),
        subticks: none
      ),
      lq.hbar(
        (1, 5, 5, 10, 2, 2),
        range(6),
      )
    )
    // tablenote goes after the #table
    #tablenote([Solutions can span multiple categories.])
  ],
  // caption is part of the #figure
  caption: [Distribution of phases the solutions are used in.]
) <bar-phases>

#figure(
  [
    #table(
      columns: 3,
      align: left,
      toprule, // separate table from other content
      table.header([*Theme*],[*Description*],[*Codes*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända, så en duplicerad och två rejected tas bort
      [
        Experiential fidelity and representational realism
      ],
      [
        Captures how systems simulate, visualize, and contextualize urban environments.
      ],
      [
        - Realism
        - Immersiveness
        - Real-time
        - Information in context
        - Simplicity vs. features
      ],
      [
        Fairness and inclusion
      ],
      [
        Captures who can participate and under what conditions of competence and access.
      ],
      [
        - Accessibility
        - Availability
        - Skill mismatch
        - Support structures
        - Change power structures
      ],
      [
        Social engagement and collective participation dynamics
      ],[
        Captures how participation emerges socially and behaviorally.
      ],[
        - Citizen engagement
        - Activism retention
        - Social media
        - Gamification
        - Power in community
      ],
      [
        Collaborative knowledge production and coordination
      ],[
        Captures structured cooperation and co-production of planning knowledge.
      ],[
        - Asynchronous collaboration
        - Knowledge sharing
        - Data altruism
        - Visualization of interests
        - Feedback cycles
      ],
      [
        Governance, infrastructure and platforms
      ],[
        Captures institutional and technical systems enabling participation.
      ],[
        - Spatial data and participation spaces
        - Open standards and platforms
        - Civic duties and rights 
        - Shared thought frameworks
      ],
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The discovered themes.]
) <results-thematic-analysis>

= Analysis
The data extraction form was then used as the source of data for our analysis. We performed QCA on fields with pre-defined choices, i.e. ''Solution typology'', ''Interaction levels'', ''Stakeholders involved'',  ''Governance model'', ''Arnstein's ladder step'' and ''Stage of planning'', and thematic analysis on the fields with free text, i.e. '' Features that enable PP'' and ''Features that hinder PP''.

== Quantitative Content Analysis
=== Solution typology and interaction levels
@table-heatmap shows that the majority of the solutions found in the reviewed studies are planning-cockpits. According to the conclusions of #cite((<NOENNIG20221462>), form: "prose"), these represent complex interactive systems modelling complex future issues and are the most complex solutions that can be developed. We also see that only a few solutions fall outside of the model of the tooling framework. These solutions integrate AI in the PP process and offer novel ways to interact with and solve PP problems.

=== Stage of planning
The phases of urban projects described by #cite(<kahachi-2025>, form: "prose") captured the majority of the solutions from the reviewed studies, with only a single study falling outside the model. The majority of solutions involve ''Phase 3: Generating and Evaluating Alternatives'', followed by ''Phase 1: Data Collection'' and ''Phase 2: Data Analysis'' in shared second place and ''Phase 4: Enabling and Enforcing Urban Change'' and ''Phase 5: Monitoring and Control'' in shared third place, followed by solutions that didn't specify or were not able to be interpreted which phase they fit into. It was noted that the study was using AI-technologies, implicitly highlighting AI's transformative power on PP processes.

=== Arnstein's ladder
@bar-arnstein shows that most solutions got categorized as either placations or consultations. A third of the solutions could not be categorized.

=== Governance model
@bar-governance shows that all of the governance models were of the type ''Hybrid / Middle-out'', showing that PP often is a two-way conversation between experts and non-experts. Some studies also did not describe or shone a light on what kind of governance model their developed solution would use, resulting in the governance model being marked as ''Not-applicable''.

== Thematic analysis
// Tematisk analys SU:
// - https://docs.google.com/document/d/1tdTHhhiau8dVVShOtypQ6sP9o-3XZarWmPctcUgk284/edit?disco=AAAB6D5bK8s
// - https://docs.google.com/document/d/1tdTHhhiau8dVVShOtypQ6sP9o-3XZarWmPctcUgk284/edit?disco=AAAB6BQCKdQ

We performed a thematic analysis on the extracted data fields ''Features that enable PP'' and ''Features that hinder PP''. The resulting themes can be seen in @results-thematic-analysis.

=== Experiential fidelity and representational realism
A reoccurring pattern in the studies is that realism and immersiveness of the solution matters in determining how positively the citizens respond to the solution, ''Users could move around, change the viewing scale, and explore model elements from varying viewpoints and scales ... therefore, IVR users had a stronger sense of informed decision-making'' and ''The “R2 - Urban Characteristics” is the most favorable among the nine factors (22.14%) ... . The urban characteristics are reflected in the New Normal virtual world with the digital twin principle. This similarity gives users a sense of belonging and makes urban planning and social interaction more natural.''.

However, there seems to be a divide between solutions prioritizing fidelity and realism compared to how well they enable participation and collaboration, ''Nonetheless, Unreal’s reliance on high-performance hardware and standalone applications restricts its accessibility for broader participatory design initiatives, contrasting with the inclusive nature of web-based platforms.'' and ''Twinmotion does not inherently facilitate real-time co-creation in VR environments with multiple participants, which constrains its utility for collaborative urban design sessions. Additionally, the platform lacks built-in embodiment features such as customizable avatars or direct interaction metaphors (e.g., hand tracking, haptics), reducing the sense of social presence and engagement typically desired in participatory urban design workflows.''.

=== Fairness and inclusion
A recurring pattern across the studies is that the solutions often assume a level of spatial literacy and technical competence that many citizens do not possess. Several studies identified usability and user experience as major barriers to participation, particularly in solutions requiring users to interpret spatial abstractions, manipulate planning tools or construct alternative urban proposals. One study concluded that ''In this research, we identified usability and user experience as the biggest challenge for integrating geospatial DPPs into participatory community planning, particularly concerning the spatial functionalities of these platforms, as a minimum level of spatial literacy is required to use and operate these platforms efficiently.'' while another found that a lack of training might also negatively impact the depth of which participants could realistically participate, ''As the users are often not experienced or trained in spatial design thinking, the abstractions of the game board and play elements often limit the player’s ability to fully understand the situation''.

The studies collectively suggest that feature-rich and technically advanced systems may unintentionally exclude less experienced participants by increasing cognitive load and requiring users to spend significant time learning new interfaces and interaction patterns. For example, a study discussing citizen-generated urban plans noted ''Creating alternative plans in VGP was an interesting way for citizens to participate in urban planning, although there were doubts whether many citizens possessed the necessary skills, especially for creating completely new plans'' and ''Developing a tool that is both easy to use and powerful enough to create plans from scratch presents a considerable challenge.''.

However, the studies also identified several strategies capable of reducing participatory barriers and broadening inclusion. A common recommendation was the use of simple, intuitive, and multi-device interfaces in conjunction with tutorials, technical support, onboarding material and starter examples. Some studies also highlighted the possibility of AR and VR to provide a familiar interface for interacting with PP processes and also improving inclusiveness, stating: ''By combining the strengths of traditional participatory methods with the innovative capabilities of AR, a more inclusive and effective approach to placemaking can be achieved.''

=== Social engagement and collective participation dynamics
The studies suggest that PP solutions are more effective when participation is experienced as a social and collaborative activity rather than an isolated individual task. Several studies identified features inspired by social media platforms, online collaboration tools, game environments and data altruism platforms as important mechanisms for sustaining citizen engagement and encouraging continued participation.

A recurring pattern was that gamification and playful interaction design could increase participant motivation and lower barriers to engagement, particularly for users with limited prior experience in PP. One study described immersive virtual reality (IVR) as ''... a highly attractive, playful, and enjoyable tool.'', noting that participants became directly involved in co-creation activities despite lacking previous experience. Similarly, another study found that ''Gamification elements further enrich this experience, encouraging citizen participation through rewarding interactions and collaborative activities that drive community engagement.'' These findings suggest that playful and rewarding interaction patterns may help transform PP from a purely technical process into a more approachable and socially engaging activity.

The studies also indicate that collaborative and intergenerational participation can strengthen engagement. One study found that although participants initially experienced difficulties using VR-tools, it remained feasible to engage users through an intergenerational approach where younger users helped older, less spatially trained users, use the tools: ''It was found that although most players expressed difficulties, it was feasible to engage residents with digital gaming tools using an intergenerational approach, and the experience was enjoyable for the older adult participants.'' This suggests that social support structures and collective participation dynamics may partially compensate for technical or spatial literacy barriers.

The studies also suggest that solutions can influence group dynamics and redistribute social power during participatory processes. One study found that IVR reduced the influence of ''... facial expressions and physical dominance'', thereby contributing to more equitable social dynamics. Similarly, another study described how an AI-supported facilitation system reduced the influence of dominant participants by ''... “taking the power out of the room” ... .'' These findings indicate that some solutions may not only support engagement, but also shape how influence and participation are distributed within collaborative planning processes.

=== Collaborative knowledge production and coordination
A recurring pattern across the studies is that the solutions become more effective when they support collaborative knowledge production and sharing rather than limiting citizens to passive one-way feedback mechanisms, where some stated that such collaborative mechanisms were the most influential factor. However, it was also noted that ''... many platforms fail to provide the user functionalities needed by users: for example, 40% of the platforms do not provide any tool for citizens to track whether their proposals, plans, or projects were implemented.''

Several studies emphasized the importance of communication and user-generated content features commonly associated with social platforms. Examples included systems where users could upload photos, comment on spatial environments, rate points of interest, create stories contextualizing plans and participate in shared planning discussions. Some solutions provided ''... a public area devoted to participatory design that support cooperation in the form of dialogues and shared knowledge about planning'' intended to support these needs. In contrast, the absence of such collaborative features was identified as a limitation: ''Based on the app demonstration, the CityBuildAR app ... only enables individual experience of users, which causes the lack of dialogue and collaborative design of spaces''. Collectively, these findings suggest that solutions require mechanisms for ongoing communication and shared interaction in order to sustain effective citizen participation, capture the wide range of qualitative data each user may produce and facilitate synthesis of several citizens opinions into shared insights.

The studies suggest that collaboration is strengthened when platforms enable citizens to actively contribute content, see project status and contextualize their perspectives. Features such as commenting systems, workshops, and narrative tools were frequently discussed as mechanisms for enabling shared understanding and asynchronous collaboration. One study noted that ''... the activist’s proposal to include a story creation feature could help users with the framing of the plan'', indicating that PP is not only dependent on technical visualization, but also on citizens being able to qualitatively communicate experiences and local knowledge in ways accessible to other citizens. Some studies even highlighted that collaborative platforms could become a shared source of knowledge for citizens: ''... where real-time data from multiple sources, such as traffic sensors, energy meters, or weather stations, can be integrated and visualized in a unified space.'' Further stating that it ''... facilitates cross-sector collaboration, fostering better communication between urban planners, citizens, and local authorities.''

=== Governance, infrastructure and platforms
A recurring pattern across the studies is that it is important to consider the governance, technical and organizational context in which the solutions exist. Several studies emphasized that the solutions require transparent process management, clearly defined communication structures and trustworthy data governance mechanisms in order to sustain meaningful participation. One study explicitly recommended to ''Ensure a transparent and efficient process management and communication framework to build trust in the use of geospatial DPPs as part of a participatory process!''. Another finding was that solutions are more effective when integrated into existing context rather than replacing them entirely. One study recommended ''Utilize geospatial DPPs in small-scale projects that are integrated into existing decision-making structures to complement well-established analog participatory community planning processes rather than replacing them!''

The studies also highlighted tensions between openness, accessibility and technical feasibility. Open-source and decentralized approaches were framed as mechanisms for democratizing participation and reducing institutional dependence. For example, one study argued that ''... publishing VGP as free and open-source software makes it available to all users and maintains its independence from staged public participation, thereby empowering direct citizen participation.'' At the same time, the studies noted that implementing such solutions introduce significant technical and organizational challenges, stating ''... technical challenges and data ownership questions pose difficulties in implementing an open-source PSS and its database.'' One study saw potential in decentralized technologies such as blockchain to solve the problem of ownership using secure, transparent and verifiable transactions, stating ''These technologies support activities ranging from voting on community proposals to verifying property ownership and managing urban assets.''

Several studies also pointed toward an emerging need for a unified framework regarding PP. One study argued that ''... there remains a critical gap: the lack of a unified, human-centered framework that bridges data systems, participatory governance, and adaptive feedback mechanisms.'' Related concerns were raised regarding ethical governance, privacy and equitable access to technology. Related concerns were raised by another study, stating: ''Ethical considerations, including data privacy, security, and equitable access to technology, must remain at the forefront of CitiVerse's development. Establishing robust governance structures and ethical guidelines will be critical to ensuring that technological innovation aligns with principles of social responsibility.'' There were also concerns that the lack of comprehensive planning principles and solutions that allow independent use hinder self-organization and, therefore, citizen empowerment.

= Discussion
// In the Discussion part of the thesis, you interpret your results and explain the significance and implications of your
// findings. The Discussion contextualizes the study within
// existing research, addresses limitations, suggests future research directions, and helps your readers understand the
// broader impact of your work.
// Comparing the results of your work to those of  previous studies is one important part of the discussion. See how this can be done in 
// \cite{Simon1996-hh} and \cite{Hevner2004-wq}.'

// Här knyter vi ihop Resultat + Analys + Assessment framework med hur det relaterar till extended background och vilka limitations vi har samt vilka framtidsutsikter som finns. 

// Följer denna: https://scientific-publishing.webshop.elsevier.com/manuscript-preparation/steps-to-write-excellent-discussion-in-manuscript/

// This section integrates the findings from the search process, QCA and thematic analyses, and the assessment framework in relation to the literature. It identifies limitations of the study and outlines directions for future research. 

== Research gaps and study contribution //1.Introduction—mention gaps in previous research
This study investigated what enables and hinders PP as well as how it changes traditional approaches to urban development. While earlier studies have explored different solutions to represent, create or analyze BIM-GIS data platforms, they have not explicitly addressed its influence on PP involving non-technical stakeholders such as citizens.

== Key findings //2. Summarizing key findings—let your data speak
This study found that solutions to PP tended to be used for generating and evaluating alternatives in urban development projects @kahachi-2025 and had a solution typology where a complex interactive system models complex future issues @NOENNIG20221462. Our study also found that PP efforts often are limited by current governance systems rather than technological systems. Additionally, this study contributes a qualitative design framework synthesized from thematic analysis that intends to support reflective evaluation of PP platforms and identify gaps in participation-oriented design.

== Relation to previous research //3. Interpreting results—compare with other papers
// Lite om equity i denna: https://www.sciencedirect.com/science/article/pii/S2666188825007610

// RQ 1: ''What features of smart city platforms enable or hinder effective participatory planning by citizens?''

// Direkta möjliggörare

// Direkta hinder
@table-heatmap shows that the solutions presented in the majority of the studies are complex interactive systems modelling complex future issues. This implies that they generally require greater development effort, more extensive testing and stronger operational support. These challenges are reflected in smart city governance literature, where pilots of solutions often struggle to transition into sustainable long-term implementations. The Amsterdam case study #cite(<EBEGUZGU2026107003>) notes that despite early emphasis on participation and diversity, these aspects are frequently disregarded later due to time and budget constraints.
// TODO: Diskutera FOSS och andra sätt att kompensera för hög komplexitet. (Risk managemet 101)

Across the reviewed studies, spatial literacy consistently appear as a limiting factor. There is a tension between offering powerful planning functionality and maintaining accessibility for non-technical stakeholders. The more advanced a solution is, the more knowledge needs to be transferred to the user, resulting in citizens being confused and frustrated if skill gaps remain when using the tools. This indicates that technical capability alone does not guarantee successful implementation of PP, but that careful thought should be put into why, what and how features should be exposed to users. Some studies also mentioned that the lack of clear guidelines in designing spatially aware tools introduced uncertainty in the design process of interaction interfaces.

A tension emerges between representational fidelity and accessibility. Highly realistic and immersive environments tend to improve spatial understanding and user engagement, but often require specialized or more computationally capable hardware.  On the flip-side, lightweight systems improve accessibility but reduce spatial realism and immersiveness, leading to lower engagement and ability for citizens to situate themselves. It is, therefore, important to balance between making the solution reflect the spatial environment in a realistic and immersive manner and making the solution able to run on performance constrained hardware.

Additionally, solutions specializing in realism and immersiveness were discovered to often lack other features important to PP, such as providing collaborative mechanisms for disseminating artifacts between citizens or allowing multiple users to collaborate on the same artifact in real-time. Conversely, solutions enabling collaborative features often put so much focus in being accessible that creating immersive and realistic environments would hinder their accessibility.

// RQ 2: ''How does top-down planning shape planning processes compared to participatory planning?''

@bar-governance shows that there were zero top-down planning approaches in all of the studies proposed solutions, highlighting that top-down planning and participatory approaches are difficult to reconcile, it also shows that zero studies produced solutions categorized in the bottom-up model. Together with the fact that most solutions use the ''Hybrid / Middle-out'' governance model, it highlights that most solutions end up as a compromise between expert- and non-expert stakeholders in practice. It could also mean that the way we recorded the governance model might be a bit too coarse grained to meaningfully reflect the complex relationships that occur when solutions are introduced.

@bar-arnstein shows that solutions mostly fall into different levels of placation. It was often difficult to find exactly what some solutions should be categorized as, as they often have some partnership-like mechanisms, but these are often enclosed within a strict framework or limited to a bounded context or space. One study broke this pattern on the design level, but the solution is still confined to current governing frameworks of the context that the solution resides within, limiting it in practice. This shows that PP is limited by governance systems to a higher degree than by technological limitations.

#cite(<kahachi-2025>, form: "prose") found that several experts advocated for integrating qualitative approaches such as ethnographic studies, stakeholder interviews and participatory mapping to capture socio-cultural and political dimensions of urban complexity. Experts also recommended integration of participatory approaches at the earliest stages of scenario development, along with the adoption of transparent and measurable evaluation criteria in order to reduce participatory tokenism. However, @bar-phases shows that the majority of the solutions enable citizens to participate in ''Phase 3: Generating and Evaluating Alternatives''.

Some solutions allowed citizens to participate in the ''Phase 1: Data Collection''. The citizens often participated by creating and uploading artifacts or discussing artifacts uploaded by other citizens or experts. The level of creativity allowed in the creation of these artifacts vary significantly between studies. Some essentially allow the citizens to produce alternative plans for entire city blocks, while others restrict the user to choose from a pre-filtered selection of available items to populate the environment with.

One recurring pattern was that expert stakeholders worried about the quality of these artifacts when seen from a perspective of how feasible they would be to realize, often pointing to economical factors, strategic goals or fit with  citizens not present at the time of proposing the alternatives. Some studies highlighted the need for educating citizens in urban development, but few studies actually provided methods to do so.

Other solutions allowed citizens to participate in ''Phase 2: Data Analysis''. This was often in the form of uploading pictures, registering issues or marking points of interest. The analysis was often limited to informal inspections of pictures or using AI-tooling to assist in analysis. Early collection of data from citizens can result in insights that prevent work that will not result in positive change for citizens.

// RQ 3: ''How can BIM-GIS be applied to design or adapt smart city platforms to improve participatory planning outcomes?''

== Design framework
Today there are a number of technical tools we can use as a platform for participation. Everything from Minecraft and VR to workshops and more conventional tools. Additionally development is always ongoing on other tools and methods that could be used to bridge the gap between citizens and professional stakeholders. In this study we have attempted to identify components that could be hindering and encouraging such participation. To bring this knowledge out and make it available in a more accessible form we have constructed an assessment framework which could be used by citizens, developers and stakeholders alike to identify gaps in the "participation-friendliness" of their tools and methods. 

// Denna är en av våra källor och har ett "framework": https://www.mdpi.com/2413-8851/9/6/196 Notera att det är typ inget framework.

//Qualitative framework
The framework is qualitative and interpretive, designed to make stakeholders consider factors and evaluate a tool or method on how well it engages with the topics presented previously in this study. To this end the framework will present questions, the answers of which, will create a basis for further analysis or to open up for discussion. The framework is not intended to be used for objective evaluation of technical or functional performance.

#show figure: set block(breakable: true)
#figure(
  [
    #table(
      columns: 2,
      align: left,
      toprule, // separate table from other content
      table.header([*Dimension*],[*Questions*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända, så en duplicerad och två rejected tas bort
      [
        Experiential fidelity and representational realism
      ],
      [
        - Does the solution:
          - Reflect the physical environment?
          - Digitally embody the user?
          - Immerse the user?
          - provide realtime data presentation of city activities, such as traffic sensors, energy meters, or weather stations?
      ],
      [
        Fairness and inclusion
      ],
      [
        - Does the solution:
          - Match the level of technical competence of its users with the requirements for its features? 
          - Require specialized hardware, such as VR-goggles?
          - Run on constrained hardware, such as mobile phones?
          - Provide onboarding material such as tutorials or reference documentation?
          - Run on several platforms and devices?
          - Have settings to support disabilities such as colorblind modes etc.?
          - Exclude users by providing redundant features to users needs?
      ],
      [
        Social engagement and collective participation dynamics
      ],[
        - Does the solution:
          - Frame participation as being part of a social and collaborative activity?
          - Provide features for social activity?
          - Provide features for creating communities?
          - Gamify or provide playful interactions?
          - Reward the user for participating?
          - Provide features to moderate users?
          - Facilitate the creation of social support structures?
      ],
      [
        Collaborative knowledge production and coordination
      ],[
        - Does the solution:
          - Provide a space to coordinate collaboration?
          - Provide a space to store shared knowledge?
          - Provide a space to track and visualize the status of proposals, plans or projects to citizens?
          - Provide a space for collaboration between experts and non-experts?
          - Provide a space for asynchronous collaboration?
          - Support uploading artifacts?
          - Support discussing proposals, plans or projects?
          - Support rating points of interest?
          - Support creating stories to frame proposals, plans or projects?
      ],
      [
        Governance, infrastructure and platforms
      ],[
        - Does the solution:
          - Support transparent process management?
          - Complement any existing decision-making structures?
          - Have a clearly defined framework for data governance?
          - Have a clearly defined framework for communication?
          - Have a clearly defined framework for data ownership?
          - Have a clearly defined framework for data privacy?
          - Have a clearly defined framework for equitable access?
          - Have a clearly defined framework for security?
          - Have a reason to not be published as open-source?
          - Build on open specifications?
          - Have components or data owned by private/public organizations?
      ],
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The design framework form.]
) <assessment>
#show figure: set block(breakable: false)

== Example application of the design framework
The design framework was designed to highlight potential gaps in solution design. As we discuss in the introduction, finding openly available solutions is difficult. Because of this, we demonstrate the design framework using an open platform that is not intended for planning purposes. The choice of platform eventually landed on the Helsinki urban data model @helsinki3d2023, as it provides a description of which technologies it builds upon, provides BIM-GIS functionality and is openly accessible to the public. The solution is intended to view, find and analyze urban data, but doesn't intend to provide planning support. Neither does it intend to provide participatory planning features. However, the solution can serve as an example of how a solution could be assessed to attempt to identify gaps in participatory design. The raw assessment can be seen in Appendix A.

The assessment suggests that the solution primarily serves as a visualization tool rather than a fully PP platform. Its strongest qualities are accessibility and spatial representation, while its weakest aspects concern collaboration and citizen participation mechanisms.

The solution partially reflects the physical environment through a CityGML-model and provides some immersive capabilities through viewsheds. The realism is limited by simplified detail of small scale urban details such as outdoor furniture and street lights and the absence of dynamic real time data. The lack of embodiment and the birds-eye perspective reduce the sense of scale and presence.

From an inclusion and accessibility perspective, the platform performs relatively well. It runs both on desktop and mobile devices without requiring specialized hardware such as VR-goggles. Additionally, it uses familiar interaction patterns that lower the barrier for users with low spatial literacy. However, performance issues occur on mobile devices when using some features and some of the tools behave unintuitively and inconsistently with touch controls. The solution seemingly lacks accessibility settings, but provides some filters that may help some users, such as brightness and outlines.

The assessment also shows that the solution provides almost no mechanisms for collaborative planning or social participation. There are no features for social interaction, community formation, moderation, collaborative work, asynchronous collaboration, or discussion between experts and citizens. Although users can create and import artifacts such as viewsheds, measurements, camera flights and shapes, these contributions remain limited in their ability to act as vehicles to share knowledge, as they cannot easily be contextualized with text elements, be discussed or collaboratively developed. This indicates that the platform prioritizes individual exploration over PP.

Governance and transparency mechanisms are weak. The solution does not clearly communicate governance structures, privacy policies, communication frameworks or decision-making processes. Some information about data ownership and governance exist externally on the City of Helsinki website, but the information is not integrated into the platform itself. At the same time, the assessment highlights that the solution builds on open source software such as Cesium, postgreSQL, postGIS and 3DCityDB and uses open data standards such as CityGML 2.0.

Overall, the assessment finds that the solution is a technically accessible and moderately high fidelity and immersive urban visualization platform, but is limited in PP features. It supports individual spatial exploration and basic artifact creation, but lacks the collaborative, social and governance-oriented mechanisms necessary to facilitate more integrated PP approaches. 

=== Limitations //4. Addressing limitations—their potential impact on the results
When creating queries we found it very difficult to create queries that captured articles in the context of participatory planning and also used BIM-GIS technology as their intervention, instead being more aligned with resolving limitations in provisioning, interoperability and visualization of BIM-GIS data or how AECO experts can use BIM-GIS technologies for top-down planning. This could mean that there is a research gap between participatory planning efforts and integrating BIM-GIS technologies with these efforts, but also that our search queries were not using the right terminology to capture related studies. Several attempts were made, but often resulting in only tangentially related studies.

@assessment shows our synthesized framework for evaluating smart city platforms. It is based on our thematic analysis performed on our SLR. This framework can be used to asses if a Planner-Cockpit that is used in Phase 3: Generating and evaluating alternatives is performing well to placate citizens in smart city planning, since the solutions we captured in our data mostly fell into these categories. A broader selection of studied solutions might lead to insights that enable the creation of a less niche assessment framework.

== Implications for future research //5. Implications for future research—how to explore further
The design framework enables evaluation of design-oriented capabilities such as collaborative features, representational fidelity, and data governance mechanisms. Future work could investigate if the design framework could be expanded to assess systemic or prescriptive capabilities as well, such as including more detailed questions about data ownership. The design framework could also be tested for inter-rater reliability to see if results are consistent across raters and investigate if parts of the design framework could be converted into quantifiable indicators where appropriate. For example, the dimension of fidelity could be grounded in the concept of LOD. A prototype solution could also be constructed and then evaluated using the framework. Future research may expand on the design framework by integrating SSC KPIs.

= Conclusion //6. Conclusion—summarize content
This study concludes that existing PP solutions using BIM-GIS technologies are limited less by visualization technology and more by governance, accessibility and collaborative work design constraints. Therefore, PP solutions should be evaluated not only technically, but socio-technically through participation-oriented design criteria.

Additionally, this study contributes a design framework that enables the user to critically assess a PP solution through five lenses. These lenses have been developed by performing a structured review and analysis of current literature describing PP solutions and analyzing features that enable and hinder PP. The framework is also anchored to the findings of existing frameworks used in PP solution design. This makes it possible to reason about its applicability, which is to assess if a PP solution is a Planner-Cockpit @NOENNIG20221462 that is used to generate and evaluate alternatives @kahachi-2025 to placate citizens according to #cite(<Arnstein01071969>, form: "prose") ladder. The study also demonstrates the use of the framework.

==== ''What features of smart city platforms enable or hinder effective participatory planning by citizens?''
In the thematic analysis it was found that fidelity and realism are important features for smart city platforms, as they provide users with a stronger sense of informed decision-making and gives a sense of belonging to the digital spatial environment. However, this study identifies that smart city platforms must balance representational fidelity with accessibility in order to meet citizens PP needs. Web based BIM-GIS platforms could be a technology that provides a solution for creating such immersive and realistic digital spatial environments, while remaining resource constrained enough to run on most devices by offloading heavy workloads to the server and providing multi-tenancy through common patterns for web technologies. It was also found that if a smart city platform lacks social interaction and collaborative features, it is experienced as being less capable of knowledge sharing and, therefore, reducing experiential and systemic capabilities, leading to lessened PP outcomes. In addition to this, it was discovered that many solutions were developed in a context where prescriptive capabilities did not meet the requirements of the design of the developed solution, leading to smart city platforms not delivering the value it had been designed for when put into practice.

==== ''How does top-down planning shape planning processes compared to participatory planning?''
In this study, we found that top-down planning is rarely reconciled with PP approaches in the reviewed studies. It is, therefore, difficult to see in our data how top-down planning compares to PP. However, the data shows that PP often is a compromise between experts and citizens interests. It also shows that PP processes have remnant elements of top-down planning, which is expressed in a lack of prescriptive and systemic capabilities, i.e. governance frameworks, that enable PP to its fullest extent.  

==== ''How can BIM-GIS be applied to design or adapt smart city platforms to improve participatory planning outcomes?''
As previously explained BIM-GIS is a rich and detailed data source that can act as a common source of knowledge. Therefore, BIM-GIS enables a practice-oriented approach to engage stakeholders in gaining experiential capabilities, but also provides systemic capabilities for collaboration between stakeholders of different knowledge levels. BIM-GIS can facilitate the immersion of citizens and help them situate themselves in PP processes.  

What we have seen in this study is that for example fidelity is strongly linked to the will to engage with a system. When a system provides a view that is detailed and rich in information, it makes users more likely to want to engage with it. If BIM-GIS data could be integrated in a technical solution that lets user for example explore the insides of buildings this could provide an experience that few other tools can provide. As the tool is providing valuable functionality to the user, the user could in turn provide data herself. This is were positive participatory planning outcomes can be gathered.

#pagebreak()

= Declaration of Interest Statement
#label("declaration-of-interest-statement")
The authors report there are no competing interests to declare.

#pagebreak()

= Appendix A: Example framework application
This is an example assessment of the Helsinki urban data model.


#show figure: set block(breakable: true)
#figure(
  [
    #table(
      columns: 2,
      align: left,
      toprule, // separate table from other content
      table.header([*Does the solution*],[*Answer*]),
      midrule, // separation between table header and body
      // Notera att vi inte tar med de 3 okända, så en duplicerad och två rejected tas bort
      [
        Reflect the physical environment?
      ],
      [
        Partially. Structures are only LOD2, which  means that e.g. pillars don't get reflected as free-standing columns, but instead flat textures on the block models. Overhangs are not represented accurately. City furniture and other small structures, such as fountains or street lights are not accurately reflected. Transient objects, such as cars and shadows are persisted on terrain textures. Vegetation such as forests are flat textures painted on terrain and on the side of building models or in mesh-mode, various meshes that blend together with buildings.
      ],
      [
        Digitally embody the user?
      ],
      [
        No. The solution does not embody the user.
      ],
      [
        Immerse the user?
      ],
      [
        Somewhat. There is a feature to create view-sheds, both cone view-sheds, and 360 view-sheds, but the user navigates using the mouse pointer from a birds-eye perspective, lessening the effect of situating and more putting them at a distance from the environment.
      ],
      [
        Provide realtime data presentation of city activities, such as traffic sensors, energy meters, or weather stations?
      ],
      [
        No, it does not.
      ],
      [
        Match the level of technical competence of its users with the requirements for its features?
      ],
      [
        The solutions uses familiar design elements from conventional solutions that are easily recognizable for users that have used those solutions before.
      ],
      [
        Require specialized hardware, such as VR-goggles?
      ],
      [
        No.
      ],
      [
        Run on constrained hardware, such as mobile phones?
      ],
      [
        Yes, The solution runs on Fairphone 5 and Samsung Galaxy S26, but it sometimes stutters when zooming and behaves in an nonintuitive manner. Zooming also functions inconsistently between across mobile platforms.
      ],
      [
        Provide onboarding material such as tutorials or reference documentation?
      ],
      [
        Yes, it links out to the solution-providers web-page.
      ],
      [
        Run on several platforms and devices?
      ],
      [
        Yes, we tested it on Desktop and Mobile.
      ],
      [
        Have settings to support disabilities such as colorblind modes etc.?
      ],
      [
        No, however the tool offers the option to add effects such as tweak lightning intensity, outline buildings etc.
      ],
      [
        Exclude users by providing redundant features to users needs?
      ],
      [
        There seems to be clear use-case for the drawing tools provided. There are some unclear features exposed in the viewsheds. It's not possible to jump to the center of the 360 viewpoint, but it is possible to jump to the cone viewshed. For some reason there is a 2D height measurement tool that is not able to be selected.
      ],
      [
        Frame participation as being part of a social and collaborative activity?
      ],
      [
        No.
      ],
      [
        Provide features for social activity?
      ],
      [
        No.
      ],
      [
        Provide features for creating communities?
      ],
      [
        No.
      ],
      [
        Gamify or provide playful interactions?
      ],
      [
        Partially. Tools like camera flight enable somewhat playful interactions.
      ],
      [
        Reward the user for participating?
      ],
      [
        No.
      ],
      [
        Provide features to moderate users?
      ],
      [
        Not applicable, there are no profiles.
      ],
      [
        Facilitate the creation of social support structures?
      ],
      [
        No.
      ],
      [
        Provide a space to coordinate collaboration?
      ],
      [
        No.
      ],
      [
        Provide a space to store shared knowledge?
      ],
      [
        No.
      ],
      [
        Provide a space to track and visualize the status of proposals, plans or projects to citizens?
      ],
      [
        No.
      ],
      [
        Provide a space for collaboration between experts and non-experts?
      ],
      [
        No.
      ],
      [
        Provide a space for asynchronous collaboration?
      ],
      [
        No.
      ],
      [
        Support uploading artifacts?
      ],
      [
        The solution supports importing shapes, measurements, viewsheds and camera flights.
      ],
      [
        Support discussing proposals, plans or projects?
      ],
      [
        No.
      ],
      [
        Support rating points of interest?
      ],
      [
        No.
      ],
      [
        Support creating stories to frame proposals, plans or projects?
      ],
      [
        Partially, the user can create camera flights and add shapes, measurements and viewsheds, but can't add text to provide descriptions.
      ],
      [
        Support transparent process management?
      ],
      [
        No. There is no information about ongoing processes.
      ],
      [
        Complement any existing decision-making structures?
      ],
      [
        Unknown.
      ],
      [
        Have a clearly defined framework for data governance?
      ],
      [
        Partially. Some data governance info can be found at the cities website: https://www.hel.fi/en/decision-making/information-on-helsinki/maps-and-geospatial-data/helsinki-3d, but the solution doesn't link to this information.
      ],
      [
        Have a clearly defined framework for communication?
      ],
      [
        No.
      ],
      [
        Have a clearly defined framework for data ownership?
      ],
      [
        Partially. The urban model is clearly stated to be licensed under CC BY 4.0 at the cities website: https://www.hel.fi/en/decision-making/information-on-helsinki/maps-and-geospatial-data/helsinki-3d, but the solution doesn't link to this information.
      ],
      [
        Have a clearly defined framework for data privacy?
      ],
      [
        Unknown. The solution also doesn't link to any information.
      ],
      [
        Have a clearly defined framework for equitable access?
      ],
      [
        Unknown. The solution also doesn't link to any information.
      ],
      [
        Have a clearly defined framework for security?
      ],
      [
        Unknown, however, since there are no profiles, or ways to store data in the platform, this is less important. The model is also licensed under CC BY 4.0.
      ],
      [
        Have a reason to not be published as open-source?
      ],
      [
        Unknown. On the cities website they state that they use open-source software, such as Cesium, postgreSQL, postGIS and 3DCityDB, but the solution seems to be provided by a private company.
      ],
      [
        Build on open specifications?
      ],
      [
        Yes. It builds on CityGML 2.0. as stated on the cities website here: https://www.hel.fi/en/decision-making/information-on-helsinki/maps-and-geospatial-data/helsinki-3d
      ],
      [
        Have components or data owned by private/public organizations?
      ],
      [
        Yes. The solution seems to be provided by Virtual City Systems: https://vc.systems/en/
      ],
    )
    // tablenote goes after the #table
    // #tablenote([Here are some additional notes.])
  ],
  // caption is part of the #figure
  caption: [The answers to the mock-assessment.]
) <assessment-example>
#show figure: set block(breakable: false)

// add your .bib file here
// #bibliography("references.bib")
#bibliography("biblio.bib")
