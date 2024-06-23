<script setup lang="ts">
// const bibliography = ref(`Amirkolaee, H. A., & Arefi, H. (2019). Height estimation from single aerial images using a
// deep convolutional encoder-decoder network. ISPRS Journal of Photogrammetry and
// Remote Sensing, 149, 50–66. https://doi.org/10.1016/j.isprsjprs.2019.01.013.
// Audebert, N., Le Saux, B., & Lefèvre, S. (2018). Beyond RGB: Very high resolution urban
// remote sensing with multimodal deep networks. ISPRS Journal of Photogrammetry and
// Remote Sensing, 140, 20–32. https://doi.org/10.1016/j.isprsjprs.2017.11.011.
// Badrinarayanan, V., Kendall, A., & Cipolla, R. (2016). SegNet: A deep convolutional encoder-decoder architecture for image segmentation. arXiv:1511.00561v3 [cs.CV].
// Batty, M. (2008). The size, scale, and shape of cities. Science, 319(5864), 769–771.
// https://doi.org/10.1126/science.1151419.
// Batty, M. (2009). Urban modeling. International encyclopedia of human geography. Oxford,
// UK: Elsevier51–58.
// Batty, M., & Longley, P. (1994). Fractal cities: A geometry of form and function. New York:
// Academic Press.
// Batty, M., & Xie, Y. (1996). Preliminary evidence for a theory of the fractal city.
// Environment & Planning A, 28(10), 1745–1762. https://doi.org/10.1068/a281745.
// Batty, M., Couclelis, H., & Eichen, M. (1997). Urban systems as cellular automata. London,
// England: SAGE Publications Sage UK.
// Batty, M. (2005). Agents, cells, and cities: New representational models for simulating
// multiscale urban dynamics. Environment & Planning A, 37(8), 1373–1394. https://doi.
// org/10.1068/a3784.
// Batty, M. (2019). Urban analytics defined. Environment and Planning B Urban Analytics and
// City Science, 46(3), 403–405. https://doi.org/10.1177/2399808319839494.
// Becattini, F., Uricchio, T., Seidenari, L., Del Bimbo, A., & Ballan, L. (2017). Am I done?
// Predicting action progress in videos. ArXiv:1705.01781 [Cs]. Retrieved fromhttp://
// arxiv.org/abs/1705.01781.
// Bettencourt, L. (2013). The origins of scaling in cities. Science, 340(6139), 1438–1441.
// Bilen, H., Fernando, B., Gavves, E., Vedaldi, A., & Gould, S. (2016). Dynamic image
// networks for action recognition. 2016 IEEE Conference on Computer Vision and Pattern
// Recognition (CVPR), 3034–3042. https://doi.org/10.1109/CVPR.2016.331.
// Bottino, A., Garbo, A., Loiacono, C., & Quer, S. (2016). Street viewer: An autonomous
// vision based traffic tracking system. Sensors, 16(6), 813. https://doi.org/10.3390/
// s16060813.
// Brock, A., Donahue, J., & Simonyan, K. (2018). Large scale GAN training for high fidelity
// natural image synthesis. ArXiv:1809.11096 [Cs, Stat]. Retrieved fromhttp://arxiv.org/
// abs/1809.11096.
// Buch, N., Velastin, S. A., & Orwell, J. (2011). A review of computer vision techniques for
// the analysis of urban traffic. IEEE Transactions on Intelligent Transportation Systems,
// 12(3), 920–939. https://doi.org/10.1109/TITS.2011.2119372.
// Buch, S., Escorcia, V., Shen, C., Ghanem, B., & Niebles, J. C. (2017). SST: Single-stream
// temporal action proposals. 2017 IEEE Conference on Computer Vision and Pattern
// Recognition (CVPR), 6373–6382. https://doi.org/10.1109/CVPR.2017.675.
// Cai, B. Y., Li, X., Seiferling, I., & Ratti, C. (2018). Treepedia 2.0: Applying deep learning for
// large-scale quantification of urban tree cover. ArXiv:1808.04754 [Cs]. Retrieved
// fromhttp://arxiv.org/abs/1808.04754.
// Calder, M., Craig, C., Culley, D., de Cani, R., Donnelly, C. A., Douglas, R., & Wilson, A.
// (2018). Computational modelling for decision-making: Where, why, what, who and
// how. Royal Society Open Science, 5(6), 172096. https://doi.org/10.1098/rsos.172096.
// Cao, Y., Wu, Z., & Shen, C. (2017). Estimating depth from monocular images as classification
// using deep fully convolutional residual networks. ArXiv:1605.02305 [Cs]. Retrieved
// fromhttp://arxiv.org/abs/1605.02305.
// Cao, Z., Simon, T., Wei, S.-E., & Sheikh, Y. (2016). Realtime multi-person 2D pose estimation
// using part affinity fields. ArXiv:1611.08050 [Cs]. Retrieved fromhttp://arxiv.org/abs/
// 1611.08050.
// Caron, M., Bojanowski, P., Joulin, A., & Douze, M. (2018). Deep clustering for unsupervised
// learning of visual features. 29.
// Cha, Y.-J., Choi, W., & Büyüköztürk, O. (2017). Deep learning-based crack damage detection using convolutional neural networks: Deep learning-based crack damage
// detection using CNNs. Computer-Aided Civil and Infrastructure Engineering, 32(5),
// 361–378. https://doi.org/10.1111/mice.12263.
// Chao, Y.-W., Vijayanarasimhan, S., Seybold, B., Ross, D. A., Deng, J., & Sukthankar, R.
// (2018). Rethinking the faster R-CNN architecture for temporal action localization.
// ArXiv:1804.07667 [Cs]. Retrieved fromhttp://arxiv.org/abs/1804.07667.
// Chaurasia, A., & Culurciello, E. (2017). LinkNet: Exploiting encoder representations for
// efficient semantic segmentation. 2017 IEEE Visual Communications and Image
// Processing (VCIP), 1–4. https://doi.org/10.1109/VCIP.2017.8305148.
// Chen, J., Dowman, I., Li, S., Li, Z., Madden, M., Mills, J., & Heipke, C. (2016). Information
// from imagery: ISPRS scientific vision and research agenda. ISPRS Journal of
// Photogrammetry and Remote Sensing, 115, 3–21. https://doi.org/10.1016/j.isprsjprs.
// 2015.09.008.
// Chen, Y., Yang, X., Zhong, B., Pan, S., Chen, D., & Zhang, H. (2016). CNNTracker: Online
// discriminative object tracking via deep convolutional neural network. Applied Soft
// Computing, 38, 1088–1098. https://doi.org/10.1016/j.asoc.2015.06.048.`)

const bibliography = ref('')

const loading = ref(false)

const metadata = ref<any[]>([])

const placeholder = 'Insert your bibliography here. For example: https://doi.org/10.1111/dome.12082'

const doisFound = computed(() => {
  const doiPattern = /(https:\/\/doi\.org\/)?(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  const matches = bibliography.value.match(doiPattern)
  if (!matches)
    return []

  const dois = matches.map((match) => {
    // Remove the prefix if it exists
    const doi = match.replace('https://doi.org/', '')
    // Remove any trailing dot
    return doi.replace(/\.$/, '')
  })

  return dois
})

const passed = computed(() => metadata.value.filter(work => work.status === 'ok').length)
const failed = computed(() => metadata.value.filter(work => work.status !== 'ok').length)

async function fetchDOIsMetadata(doi: string) {
  const url = 'https://api.crossref.org/works/'

  const response = await fetch(url + doi)
  const data = await response.json()
  return data
}

async function getAllDOIsMetadata() {
  metadata.value = []
  for (const doi of doisFound.value) {
    try {
      loading.value = true
      const data = await fetchDOIsMetadata(doi)
      metadata.value.push(data)
    }
    catch (error) {
      metadata.value.push({ status: 'error', message: { title: [`DOI: ${doi}`], DOI: doi } })
    }
    finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <v-card
    flat
    min-width="400px"
    title="The Source Taster"
  >
    <template #append>
      <v-tooltip>
        <template #activator="{ props }">
          <v-icon
            size="large"
            icon="i-mdi-help-circle-outline"
            v-bind="props"
          />
        </template>
        <p class="text-h6">
          How does it work?
        </p>
        <p><span class="font-italic font-weight-bold">The Source Taster</span> extracts the DOIs from your bibliography and checks them using the CrossRef database.</p>
      </v-tooltip>
    </template>
    <v-card-text>
      <v-textarea
        v-model="bibliography"
        auto-grow
        :placeholder
        hide-details
        max-rows="8"
        :rows="3"
        autofocus
        @update:model-value="getAllDOIsMetadata"
      />
    </v-card-text>
  </v-card>

  <v-divider class="border-opacity-100" />

  <v-card
    title="Report"
    :loading
    flat
  >
    <v-card-subtitle>
      <p>{{ `Found: ${doisFound.length}` }}</p>
      <p>{{ `Passed: ${passed}` }}</p>
      <p>{{ `Failed: ${failed}` }}</p>
    </v-card-subtitle>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="work in metadata"
          :key="work"
          color="error"
          :active="work.status !== 'ok'"
        >
          <template #prepend>
            <v-icon
              size="x-large"
              :color="work.status === 'ok' ? 'success' : 'error'"
              :icon="work.status === 'ok' ? 'i-mdi-check-circle-outline' : 'i-mdi-close-circle-outline'"
            />
          </template>

          <v-list-item-title>
            {{ work.status === 'ok' ? work.message.title[0] : 'Not Found' }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ `DOI:${work.message.DOI}` }}
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              density="compact"
              icon="i-mdi-content-copy"
              variant="plain"
              size="large"
            />
            <v-btn
              v-if="work.status === 'ok'"
              density="compact"

              icon="i-mdi-open-in-new"
              variant="plain"

              size="large"
            />

            <v-tooltip
              v-else
            >
              <template #activator="{ props }">
                <v-btn
                  density="compact"
                  v-bind="props"
                  icon="i-mdi-information-outline "
                  variant="plain"

                  size="large"
                />
              </template>
              <p class="font-weight-bold text-h6">
                Why couldn't the work be found?
              </p>
              <p class="text-subtitle-1">
                There could be several reasons for this:
              </p>

              <ol class="text-body-2">
                <li>
                  The DOI was not extracted properly. Please verify the DOI.
                </li>
                <li>The DOI is not registered in the CrossRef database. You may want to check other databases.</li>
                <li>The DOI does not exist.</li>
              </ol>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
